import os
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserRole
from app.models.subscription import SubscriptionPlan, UserSubscription, UsageTracking, ExtraPackPurchase
from app.services.auth import get_current_user
from app.services.usage import get_user_plan, ensure_usage

router = APIRouter(prefix="/api/subscription", tags=["Subscription"])

QPAY_BASE = "https://merchant.qpay.mn/v2"
PRO_PRICE = 5900
EXTRA_PACK_PRICE = 3900


def _qpay_token() -> str:
    import httpx
    username = os.getenv("QPAY_USERNAME")
    password = os.getenv("QPAY_PASSWORD")
    if not username or not password:
        raise HTTPException(status_code=503, detail="QPay тохиргоогүй байна")
    res = httpx.post(f"{QPAY_BASE}/auth/token", auth=(username, password), timeout=10)
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="QPay нэвтрэхэд алдаа")
    return res.json()["access_token"]


class CreateInvoiceRequest(BaseModel):
    type: str  # "pro" or "extra_pack"


@router.get("/usage")
def get_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.admin:
        return {"plan": "admin", "unlimited": True}

    plan = get_user_plan(current_user.id, db)
    usage = ensure_usage(current_user.id, db)

    now = datetime.now(timezone.utc)
    sub = (
        db.query(UserSubscription)
        .filter(UserSubscription.user_id == current_user.id, UserSubscription.period_end > now)
        .first()
    )

    extra_packs = (
        db.query(ExtraPackPurchase)
        .filter(ExtraPackPurchase.user_id == current_user.id)
        .all()
    )
    extra_ai = sum(e.ai_remaining for e in extra_packs if e.ai_remaining > 0)
    extra_tr = sum(e.tr_remaining for e in extra_packs if e.tr_remaining > 0)

    effective_ai_limit = current_user.custom_ai_limit if current_user.custom_ai_limit is not None else plan.ai_limit
    effective_tr_limit = current_user.custom_tr_limit if current_user.custom_tr_limit is not None else plan.tr_limit

    return {
        "plan": plan.name,
        "plan_expires": sub.period_end.isoformat() if sub else None,
        "ai_used": usage.ai_used,
        "ai_limit": effective_ai_limit,
        "tr_used": usage.tr_used,
        "tr_limit": effective_tr_limit,
        "cover_letter": plan.cover_letter,
        "watermark": plan.watermark,
        "extra_ai": extra_ai,
        "extra_tr": extra_tr,
        "custom_ai_limit": current_user.custom_ai_limit,
        "custom_tr_limit": current_user.custom_tr_limit,
        "period_end": usage.period_end.isoformat(),
    }


@router.post("/create-invoice")
def create_invoice(
    req: CreateInvoiceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import httpx

    if req.type not in ("pro", "extra_pack"):
        raise HTTPException(status_code=400, detail="type нь 'pro' эсвэл 'extra_pack' байх ёстой")

    if req.type == "extra_pack":
        plan = get_user_plan(current_user.id, db)
        if plan.name != "pro":
            raise HTTPException(status_code=403, detail="Extra Pack зөвхөн Pro эрхтэй хэрэглэгчид авах боломжтой")

    invoice_code = os.getenv("QPAY_INVOICE_CODE")
    if not invoice_code:
        raise HTTPException(status_code=503, detail="QPay тохиргоогүй байна")

    amount = PRO_PRICE if req.type == "pro" else EXTRA_PACK_PRICE
    description = "CareerPrep Pro эрх / 1 сар" if req.type == "pro" else "CareerPrep Extra Pack"
    sender_no = f"{req.type}_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}"
    callback_url = f"{os.getenv('API_BASE_URL', 'http://localhost:8001')}/api/subscription/qpay/callback"

    token = _qpay_token()
    res = httpx.post(
        f"{QPAY_BASE}/invoice",
        json={
            "invoice_code": invoice_code,
            "sender_invoice_no": sender_no,
            "invoice_receiver_code": str(current_user.id),
            "invoice_description": description,
            "amount": amount,
            "callback_url": callback_url,
        },
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    if res.status_code != 200:
        raise HTTPException(status_code=502, detail="QPay invoice үүсгэхэд алдаа")

    data = res.json()
    return {
        "invoice_id": data.get("invoice_id"),
        "qr_text": data.get("qr_text"),
        "qr_image": data.get("qr_image"),
        "urls": data.get("urls", []),
        "type": req.type,
        "amount": amount,
    }


@router.post("/qpay/callback")
def qpay_callback(payload: dict, db: Session = Depends(get_db)):
    """QPay calls this endpoint after successful payment."""
    import httpx

    invoice_id = payload.get("invoice_id") or payload.get("qpay_payment_id")
    sender_no: str = payload.get("sender_invoice_no", "")

    if not sender_no:
        return {"status": "ignored"}

    # sender_invoice_no: "pro_<uid>_<ts>" or "extra_pack_<uid>_<ts>"
    if sender_no.startswith("extra_pack_"):
        inv_type = "extra_pack"
        rest = sender_no[len("extra_pack_"):]
    elif sender_no.startswith("pro_"):
        inv_type = "pro"
        rest = sender_no[len("pro_"):]
    else:
        return {"status": "ignored"}

    try:
        user_id = int(rest.split("_")[0])
    except (ValueError, IndexError):
        return {"status": "ignored"}

    # Verify payment with QPay
    try:
        token = _qpay_token()
        check = httpx.post(
            f"{QPAY_BASE}/payment/check",
            json={"object_type": "INVOICE", "object_id": invoice_id},
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        if check.status_code != 200 or check.json().get("count", 0) == 0:
            return {"status": "not_paid"}
    except Exception:
        return {"status": "error"}

    if inv_type == "pro":
        now = datetime.now(timezone.utc)
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if period_start.month == 12:
            period_end = period_start.replace(year=period_start.year + 1, month=1)
        else:
            period_end = period_start.replace(month=period_start.month + 1)

        pro_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "pro").first()
        if not pro_plan:
            return {"status": "error", "detail": "Pro plan олдсонгүй"}

        sub = db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()
        if sub:
            sub.plan_id = pro_plan.id
            sub.period_start = period_start
            sub.period_end = period_end
            sub.payment_ref = str(invoice_id)
        else:
            db.add(UserSubscription(
                user_id=user_id,
                plan_id=pro_plan.id,
                period_start=period_start,
                period_end=period_end,
                payment_ref=str(invoice_id),
            ))
        db.commit()

    elif inv_type == "extra_pack":
        db.add(ExtraPackPurchase(
            user_id=user_id,
            ai_remaining=20,
            tr_remaining=10,
            tr_char_remaining=80000,
            payment_ref=str(invoice_id),
        ))
        db.commit()

    return {"status": "ok"}


class SetUserLimitsRequest(BaseModel):
    ai_limit: Optional[int] = None
    tr_limit: Optional[int] = None


@router.patch("/admin/users/{user_id}/limits")
def set_user_limits(
    user_id: int,
    req: SetUserLimitsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Зөвхөн админ")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")

    if req.ai_limit is not None and req.ai_limit < 0:
        raise HTTPException(status_code=400, detail="AI лимит 0-с бага байж болохгүй")
    if req.tr_limit is not None and req.tr_limit < 0:
        raise HTTPException(status_code=400, detail="Орчуулгын лимит 0-с бага байж болохгүй")

    target.custom_ai_limit = req.ai_limit
    target.custom_tr_limit = req.tr_limit
    db.commit()

    return {
        "status": "ok",
        "user_id": user_id,
        "custom_ai_limit": target.custom_ai_limit,
        "custom_tr_limit": target.custom_tr_limit,
    }


@router.post("/admin/activate-pro/{user_id}")
def admin_activate_pro(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: manually activate Pro for a user (for testing)."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Зөвхөн админ")

    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if period_start.month == 12:
        period_end = period_start.replace(year=period_start.year + 1, month=1)
    else:
        period_end = period_start.replace(month=period_start.month + 1)

    pro_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "pro").first()
    sub = db.query(UserSubscription).filter(UserSubscription.user_id == user_id).first()
    if sub:
        sub.plan_id = pro_plan.id
        sub.period_start = period_start
        sub.period_end = period_end
        sub.payment_ref = "admin_manual"
    else:
        db.add(UserSubscription(
            user_id=user_id,
            plan_id=pro_plan.id,
            period_start=period_start,
            period_end=period_end,
            payment_ref="admin_manual",
        ))
    db.commit()
    return {"status": "ok", "user_id": user_id, "plan": "pro", "expires": period_end.isoformat()}
