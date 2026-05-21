import csv
import io
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import cast, Date, or_, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.services.cache import cache_get, cache_set

_TEMPLATES_TTL = 300  # 5 минут
from app.models.cv import CV
from app.models.user import User
from app.schemas.user import UserAdminResponse, UserUpdateAdmin
from app.services.auth import get_current_user
from app.models.email_token import TokenType
from app.services.email_service import send_password_reset_email
from app.routers.auth import _create_token, _check_email_cooldown

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ хандах эрхтэй")
    return current_user


class AdminPasswordResetRequest(BaseModel):
    email: str


@router.post("/users/send-password-reset")
def admin_send_password_reset(
    data: AdminPasswordResetRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    target = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if target and target.is_active:
        _check_email_cooldown(db, target, TokenType.reset_password)
        token = _create_token(db, target, TokenType.reset_password, hours=1)
        background_tasks.add_task(send_password_reset_email, target.email, target.first_name, token)

    from app.models.audit_log import AuditLog
    ip = request.client.host if request.client else "unknown"
    db.add(AuditLog(
        user_id=admin.id,
        action="admin_send_password_reset",
        ip_address=ip,
        details=data.email,
    ))
    db.commit()

    return {"message": "Хэрэв тухайн и-мэйл бүртгэлтэй бол нууц үг сэргээх линк илгээгдсэн."}


# ── User list ─────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserAdminResponse])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(User)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(User.first_name).like(like),
                func.lower(User.last_name).like(like),
                func.lower(User.email).like(like),
            )
        )
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for u in users:
        cv_count = db.query(CV).filter(CV.user_id == u.id).count()
        result.append(UserAdminResponse(
            id=u.id,
            first_name=u.first_name,
            last_name=u.last_name,
            email=u.email,
            phone=u.phone,
            role=u.role.value if hasattr(u.role, "value") else u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            cv_count=cv_count,
            custom_ai_limit=u.custom_ai_limit,
            custom_tr_limit=u.custom_tr_limit,
        ))
    return result


# ── CSV export (before /{user_id} to avoid routing conflict) ──────────────────

@router.get("/users/export")
def export_users_csv(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["ID", "Овог", "Нэр", "И-мэйл", "Утас", "Эрх", "Төлөв", "Бүртгэсэн"])
    for u in users:
        writer.writerow([
            u.id,
            u.last_name,
            u.first_name,
            u.email,
            u.phone or "",
            u.role.value if hasattr(u.role, "value") else u.role,
            "Идэвхтэй" if u.is_active else "Хаагдсан",
            u.created_at.strftime("%Y-%m-%d") if u.created_at else "",
        ])
    filename = f"users_{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode("utf-8-sig")),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ── Subscription / usage overview (before /{user_id} to avoid routing conflict) ──

@router.get("/users/usage-overview")
def users_usage_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from app.models.subscription import SubscriptionPlan, UserSubscription, UsageTracking, ExtraPackPurchase
    from app.services.usage import get_user_plan, ensure_usage

    now = datetime.now(timezone.utc)

    all_users = db.query(User).filter(User.role != "admin").order_by(User.created_at.desc()).all()

    rows = []
    total_ai_used = 0
    total_tr_used = 0
    pro_count = 0

    for u in all_users:
        plan = get_user_plan(u.id, db)
        usage = ensure_usage(u.id, db)

        sub = (
            db.query(UserSubscription)
            .filter(UserSubscription.user_id == u.id, UserSubscription.period_end > now)
            .first()
        )
        extra_packs = db.query(ExtraPackPurchase).filter(ExtraPackPurchase.user_id == u.id).all()
        extra_ai = sum(e.ai_remaining for e in extra_packs if e.ai_remaining > 0)
        extra_tr = sum(e.tr_remaining for e in extra_packs if e.tr_remaining > 0)

        effective_ai = u.custom_ai_limit if u.custom_ai_limit is not None else plan.ai_limit
        effective_tr = u.custom_tr_limit if u.custom_tr_limit is not None else plan.tr_limit

        if plan.name == "pro":
            pro_count += 1
        total_ai_used += usage.ai_used
        total_tr_used += usage.tr_used

        rows.append({
            "id": u.id,
            "name": f"{u.last_name} {u.first_name}".strip(),
            "email": u.email,
            "is_active": u.is_active,
            "plan": plan.name,
            "plan_expires": sub.period_end.isoformat() if sub else None,
            "ai_used": usage.ai_used,
            "ai_limit": effective_ai,
            "tr_used": usage.tr_used,
            "tr_limit": effective_tr,
            "extra_ai": extra_ai,
            "extra_tr": extra_tr,
            "period_end": usage.period_end.isoformat(),
        })

    return {
        "summary": {
            "total": len(all_users),
            "pro": pro_count,
            "free": len(all_users) - pro_count,
            "total_ai_used": total_ai_used,
            "total_tr_used": total_tr_used,
        },
        "users": rows,
    }


# ── Bulk delete ───────────────────────────────────────────────────────────────

class BulkDeleteRequest(BaseModel):
    user_ids: List[int]


@router.delete("/users/bulk")
def bulk_delete_users(
    data: BulkDeleteRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not data.user_ids:
        raise HTTPException(status_code=400, detail="Хэрэглэгч сонгоогүй байна")
    if admin.id in data.user_ids:
        raise HTTPException(status_code=400, detail="Өөрийгөө устгах боломжгүй")
    deleted = db.query(User).filter(User.id.in_(data.user_ids)).delete(synchronize_session=False)
    db.commit()
    return {"deleted": deleted}


# ── Single user CRUD ──────────────────────────────────────────────────────────

@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user_detail(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")
    cv_count = db.query(CV).filter(CV.user_id == user.id).count()
    return UserAdminResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, "value") else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        cv_count=cv_count,
    )


@router.put("/users/{user_id}", response_model=UserAdminResponse)
def update_user(
    user_id: int,
    data: UserUpdateAdmin,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")
    if user.id == admin.id and (data.is_active is False or data.role == "user"):
        raise HTTPException(status_code=400, detail="Өөрийнхөө эрхийг өөрчлөх боломжгүй")
    if data.role is not None:
        if data.role not in ("user", "admin"):
            raise HTTPException(status_code=400, detail="Буруу role")
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    cv_count = db.query(CV).filter(CV.user_id == user.id).count()
    return UserAdminResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, "value") else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        cv_count=cv_count,
    )


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Өөрийгөө устгах боломжгүй")
    db.delete(user)
    db.commit()
    return {"message": "Хэрэглэгч устгагдлаа"}


# ── Stats + analytics ─────────────────────────────────────────────────────────

@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_cvs = db.query(CV).count()

    # 30-day daily breakdown
    today = datetime.now(timezone.utc).date()
    thirty_ago = datetime.now(timezone.utc) - timedelta(days=29)

    reg_rows = (
        db.query(cast(User.created_at, Date).label("d"), func.count(User.id).label("n"))
        .filter(User.created_at >= thirty_ago)
        .group_by("d").order_by("d").all()
    )
    cv_rows = (
        db.query(cast(CV.created_at, Date).label("d"), func.count(CV.id).label("n"))
        .filter(CV.created_at >= thirty_ago)
        .group_by("d").order_by("d").all()
    )

    reg_map = {r.d: r.n for r in reg_rows}
    cv_map = {r.d: r.n for r in cv_rows}
    date_range = [today - timedelta(days=29 - i) for i in range(30)]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": total_users - active_users,
        "total_admins": total_admins,
        "total_cvs": total_cvs,
        "daily_registrations": [{"date": str(d), "count": reg_map.get(d, 0)} for d in date_range],
        "daily_cvs": [{"date": str(d), "count": cv_map.get(d, 0)} for d in date_range],
    }


# ── Full dashboard ───────────────────────────────────────────────────────────

@router.get("/dashboard")
def admin_dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from app.models.interview import InterviewQuestion
    from app.models.advice import Advice
    from app.models.scholarship import Scholarship
    from app.models.progress import UserQuizResult
    from app.models.scholarship_bookmark import ScholarshipBookmark
    from app.models.audit_log import AuditLog
    from datetime import date

    # ── Counts ──────────────────────────────────────────────────────────────
    total_users     = db.query(User).count()
    active_users    = db.query(User).filter(User.is_active == True).count()
    suspended_users = total_users - active_users
    admin_count     = db.query(User).filter(User.role == "admin").count()
    unverified      = db.query(User).filter(User.is_verified == False).count()
    total_cvs       = db.query(CV).count()
    total_scholars  = db.query(Scholarship).count()
    total_questions = db.query(InterviewQuestion).count()
    total_advice    = db.query(Advice).count()
    published_advice= db.query(Advice).filter(Advice.is_published == True).count()
    total_quizzes   = db.query(UserQuizResult).count()
    total_bookmarks = db.query(ScholarshipBookmark).count()

    # ── CV by template ───────────────────────────────────────────────────────
    cv_by_template = (
        db.query(CV.template_type, func.count(CV.id).label("n"))
        .group_by(CV.template_type).all()
    )

    # ── Interview questions by category ─────────────────────────────────────
    q_by_cat = (
        db.query(InterviewQuestion.category, func.count(InterviewQuestion.id).label("n"))
        .group_by(InterviewQuestion.category).all()
    )

    # ── Advice by category ───────────────────────────────────────────────────
    adv_by_cat = (
        db.query(Advice.category, func.count(Advice.id).label("n"))
        .filter(Advice.is_published == True)
        .group_by(Advice.category).all()
    )

    # ── Scholarships: upcoming deadlines ────────────────────────────────────
    upcoming = (
        db.query(Scholarship)
        .filter(Scholarship.deadline != None, Scholarship.deadline >= date.today())
        .order_by(Scholarship.deadline)
        .limit(5).all()
    )

    # ── 30-day trends ────────────────────────────────────────────────────────
    today = datetime.now(timezone.utc).date()
    thirty_ago = datetime.now(timezone.utc) - timedelta(days=29)

    reg_rows = (
        db.query(cast(User.created_at, Date).label("d"), func.count(User.id).label("n"))
        .filter(User.created_at >= thirty_ago)
        .group_by("d").order_by("d").all()
    )
    cv_rows = (
        db.query(cast(CV.created_at, Date).label("d"), func.count(CV.id).label("n"))
        .filter(CV.created_at >= thirty_ago)
        .group_by("d").order_by("d").all()
    )
    reg_map = {r.d: r.n for r in reg_rows}
    cv_map  = {r.d: r.n for r in cv_rows}
    date_range = [today - timedelta(days=29 - i) for i in range(30)]
    daily_registrations = [{"date": str(d), "count": reg_map.get(d, 0)} for d in date_range]
    daily_cvs           = [{"date": str(d), "count": cv_map.get(d, 0)} for d in date_range]

    # ── Recent users ─────────────────────────────────────────────────────────
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(7).all()

    # ── Recent audit logs ────────────────────────────────────────────────────
    recent_logs = (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .order_by(AuditLog.created_at.desc())
        .limit(12)
        .all()
    )
    logs_out = [
        {
            "id": log.id,
            "user_name": f"{log.user.last_name} {log.user.first_name}" if log.user else None,
            "action": log.action,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in recent_logs
    ]

    return {
        "counts": {
            "users": total_users,
            "active_users": active_users,
            "suspended_users": suspended_users,
            "admins": admin_count,
            "unverified": unverified,
            "cvs": total_cvs,
            "scholarships": total_scholars,
            "interview_questions": total_questions,
            "advice": total_advice,
            "published_advice": published_advice,
            "quiz_results": total_quizzes,
            "bookmarks": total_bookmarks,
        },
        "cv_by_template": [{"template": r.template_type, "count": r.n} for r in cv_by_template],
        "questions_by_category": [{"category": str(r.category.value if hasattr(r.category, "value") else r.category), "count": r.n} for r in q_by_cat],
        "advice_by_category": [{"category": str(r.category.value if hasattr(r.category, "value") else r.category), "count": r.n} for r in adv_by_cat],
        "upcoming_scholarships": [
            {"id": s.id, "name": s.name, "deadline": str(s.deadline), "organization": s.organization}
            for s in upcoming
        ],
        "daily_registrations": daily_registrations,
        "daily_cvs": daily_cvs,
        "recent_users": [
            {
                "id": u.id,
                "name": f"{u.last_name} {u.first_name}",
                "email": u.email,
                "role": u.role.value if hasattr(u.role, "value") else u.role,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in recent_users
        ],
        "recent_logs": logs_out,
    }


# ── CV templates ─────────────────────────────────────────────────────────────

@router.get("/cv-templates")
def get_cv_templates(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    cached = cache_get("cv_templates", _TEMPLATES_TTL)
    if cached is not None:
        return cached
    rows = (
        db.query(CV.template_type, func.count(CV.id).label("count"))
        .group_by(CV.template_type)
        .all()
    )
    total = db.query(CV).count()
    result = {
        "total": total,
        "templates": [{"name": r.template_type, "count": r.count} for r in rows],
    }
    cache_set("cv_templates", result)
    return result


# ── Audit logs ────────────────────────────────────────────────────────────────

@router.get("/audit-logs")
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    action: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from app.models.audit_log import AuditLog

    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for log in logs:
        user_info = None
        if log.user_id:
            u = db.query(User).filter(User.id == log.user_id).first()
            if u:
                user_info = {"id": u.id, "name": f"{u.last_name} {u.first_name}", "email": u.email}
        result.append({
            "id": log.id,
            "user": user_info,
            "action": log.action,
            "ip_address": log.ip_address,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })
    return result
