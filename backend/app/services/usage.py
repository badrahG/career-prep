from datetime import datetime, timezone
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.subscription import SubscriptionPlan, UserSubscription, UsageTracking, ExtraPackPurchase
from app.services.auth import get_current_user

MAX_TR_CHARS_PER_CALL = 8000


def _month_period(now: datetime):
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def get_user_plan(user_id: int, db: Session) -> SubscriptionPlan:
    now = datetime.now(timezone.utc)
    sub = (
        db.query(UserSubscription)
        .filter(UserSubscription.user_id == user_id, UserSubscription.period_end > now)
        .first()
    )
    if sub:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == sub.plan_id).first()
        if plan:
            return plan
    return db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "free").first()


def ensure_usage(user_id: int, db: Session) -> UsageTracking:
    now = datetime.now(timezone.utc)
    usage = db.query(UsageTracking).filter(UsageTracking.user_id == user_id).first()
    period_start, period_end = _month_period(now)

    if usage is None:
        usage = UsageTracking(
            user_id=user_id,
            ai_used=0,
            tr_used=0,
            tr_char_used=0,
            period_start=period_start,
            period_end=period_end,
        )
        db.add(usage)
        db.commit()
        db.refresh(usage)
    elif now >= usage.period_end:
        usage.ai_used = 0
        usage.tr_used = 0
        usage.tr_char_used = 0
        usage.period_start = period_start
        usage.period_end = period_end
        db.commit()
        db.refresh(usage)

    return usage


def ai_limit_check(cost: int = 1):
    """Dependency factory — checks and charges AI credits before the endpoint runs."""
    def _dep(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role == UserRole.admin:
            return current_user

        plan = get_user_plan(current_user.id, db)
        usage = ensure_usage(current_user.id, db)

        effective_ai_limit = current_user.custom_ai_limit if current_user.custom_ai_limit is not None else plan.ai_limit

        if usage.ai_used + cost <= effective_ai_limit:
            usage.ai_used += cost
            db.commit()
            return current_user

        extra = (
            db.query(ExtraPackPurchase)
            .filter(
                ExtraPackPurchase.user_id == current_user.id,
                ExtraPackPurchase.ai_remaining >= cost,
            )
            .order_by(ExtraPackPurchase.purchased_at)
            .first()
        )
        if extra:
            extra.ai_remaining -= cost
            db.commit()
            return current_user

        raise HTTPException(
            status_code=403,
            detail={
                "code": "ai_limit_exceeded",
                "plan": plan.name,
                "used": usage.ai_used,
                "limit": effective_ai_limit,
            },
        )

    return _dep


def tr_limit_check(user: User, text_length: int, db: Session) -> None:
    """Called inline in translate endpoint after text_length is known."""
    if user.role == UserRole.admin:
        return

    if text_length > MAX_TR_CHARS_PER_CALL:
        raise HTTPException(
            status_code=400,
            detail=f"Орчуулах текст {MAX_TR_CHARS_PER_CALL} тэмдэгтээс хэтэрч болохгүй",
        )

    plan = get_user_plan(user.id, db)
    usage = ensure_usage(user.id, db)
    effective_tr_limit = user.custom_tr_limit if user.custom_tr_limit is not None else plan.tr_limit

    if usage.tr_used < effective_tr_limit:
        usage.tr_used += 1
        usage.tr_char_used += text_length
        db.commit()
        return

    extra = (
        db.query(ExtraPackPurchase)
        .filter(
            ExtraPackPurchase.user_id == user.id,
            ExtraPackPurchase.tr_remaining > 0,
        )
        .order_by(ExtraPackPurchase.purchased_at)
        .first()
    )
    if extra:
        extra.tr_remaining -= 1
        extra.tr_char_remaining -= text_length
        usage.tr_char_used += text_length
        db.commit()
        return

    raise HTTPException(
        status_code=403,
        detail={
            "code": "tr_limit_exceeded",
            "plan": plan.name,
            "used": usage.tr_used,
            "limit": effective_tr_limit,
        },
    )
