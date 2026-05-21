from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.cv import CVTemplateFeedback
from app.models.system_feedback import SystemFeedback
from app.services.auth import get_current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ хандах боломжтой")
    return current_user

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

VALID_TEMPLATES = {"modern", "classic", "minimal", "United States", "Australia", "Japan"}


class FeedbackSubmit(BaseModel):
    template_type: str
    rating: int = Field(..., ge=1, le=5)
    pros: Optional[str] = None
    cons: Optional[str] = None


class FeedbackOut(BaseModel):
    rating: int
    pros: Optional[str]
    cons: Optional[str]
    template_type: str


@router.post("/cv-template")
def submit_feedback(
    data: FeedbackSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.template_type not in VALID_TEMPLATES:
        raise HTTPException(status_code=400, detail="Загварын төрөл буруу байна")

    existing = db.query(CVTemplateFeedback).filter_by(
        user_id=current_user.id,
        template_type=data.template_type,
    ).first()

    if existing:
        existing.rating = data.rating
        existing.pros = (data.pros or "").strip() or None
        existing.cons = (data.cons or "").strip() or None
    else:
        fb = CVTemplateFeedback(
            user_id=current_user.id,
            template_type=data.template_type,
            rating=data.rating,
            pros=(data.pros or "").strip() or None,
            cons=(data.cons or "").strip() or None,
        )
        db.add(fb)

    db.commit()
    return {"ok": True}


@router.get("/cv-template/my")
def get_my_feedback(
    template_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if template_type not in VALID_TEMPLATES:
        raise HTTPException(status_code=400, detail="Загварын төрөл буруу байна")
    fb = db.query(CVTemplateFeedback).filter_by(
        user_id=current_user.id,
        template_type=template_type,
    ).first()
    if not fb:
        return None
    return FeedbackOut(rating=fb.rating, pros=fb.pros, cons=fb.cons, template_type=fb.template_type)


@router.get("/cv-template/summary")
def get_summary(db: Session = Depends(get_db)):
    rows = (
        db.query(
            CVTemplateFeedback.template_type,
            func.round(func.avg(CVTemplateFeedback.rating), 1).label("avg"),
            func.count(CVTemplateFeedback.id).label("count"),
        )
        .group_by(CVTemplateFeedback.template_type)
        .all()
    )
    return {r.template_type: {"avg": float(r.avg), "count": r.count} for r in rows}


@router.get("/cv-template/list")
def get_feedbacks(
    template_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if template_type not in VALID_TEMPLATES:
        raise HTTPException(status_code=400, detail="Загварын төрөл буруу байна")
    rows = (
        db.query(CVTemplateFeedback, User.email, User.first_name, User.last_name)
        .join(User, CVTemplateFeedback.user_id == User.id)
        .filter(CVTemplateFeedback.template_type == template_type)
        .order_by(CVTemplateFeedback.created_at.desc())
        .all()
    )
    return [
        {
            "rating": r.CVTemplateFeedback.rating,
            "pros": r.CVTemplateFeedback.pros,
            "cons": r.CVTemplateFeedback.cons,
            "user_email": r.email,
            "user_name": (r.last_name + " " + r.first_name).strip() if (r.first_name or r.last_name) else None,
            "created_at": r.CVTemplateFeedback.created_at.isoformat() if r.CVTemplateFeedback.created_at else None,
        }
        for r in rows
    ]


# ── System Feedback ──────────────────────────────────────────────────────────

VALID_CATEGORIES = {"general", "cv", "interview", "scholarship", "other"}
CATEGORY_LABELS = {
    "general": "Ерөнхий",
    "cv": "CV Builder",
    "interview": "Ярилцлагын бэлтгэл",
    "scholarship": "Тэтгэлэг",
    "other": "Бусад",
}


class SystemFeedbackSubmit(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    category: str = "general"
    message: Optional[str] = None


@router.post("/system")
def submit_system_feedback(
    data: SystemFeedbackSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Категори буруу байна")
    fb = SystemFeedback(
        user_id=current_user.id,
        rating=data.rating,
        category=data.category,
        message=(data.message or "").strip() or None,
    )
    db.add(fb)
    db.commit()
    return {"ok": True}


@router.get("/system/admin")
def get_system_feedbacks(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total = db.query(func.count(SystemFeedback.id)).scalar() or 0
    avg_rating = db.query(func.round(func.avg(SystemFeedback.rating), 1)).scalar()
    by_category = (
        db.query(SystemFeedback.category, func.count(SystemFeedback.id).label("n"))
        .group_by(SystemFeedback.category)
        .all()
    )
    rows = (
        db.query(SystemFeedback, User.email, User.first_name, User.last_name)
        .outerjoin(User, SystemFeedback.user_id == User.id)
        .order_by(SystemFeedback.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    items = [
        {
            "id": r.SystemFeedback.id,
            "rating": r.SystemFeedback.rating,
            "category": r.SystemFeedback.category,
            "category_label": CATEGORY_LABELS.get(r.SystemFeedback.category, r.SystemFeedback.category),
            "message": r.SystemFeedback.message,
            "user_email": r.email,
            "user_name": ((r.last_name or "") + " " + (r.first_name or "")).strip() or None,
            "created_at": r.SystemFeedback.created_at.isoformat() if r.SystemFeedback.created_at else None,
        }
        for r in rows
    ]
    return {
        "total": total,
        "avg_rating": float(avg_rating) if avg_rating else None,
        "by_category": {r.category: r.n for r in by_category},
        "items": items,
    }
