from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional

from app.database import get_db
from app.models.advice import Advice
from app.models.user import User
from app.schemas.advice import AdviceCreate, AdviceResponse, AdviceStats
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/advice", tags=["Advice"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ")
    return current_user


VALID_CATEGORIES = ("cv", "interview", "job_search", "career")


# ---------- Public endpoints ----------

@router.get("/", response_model=List[AdviceResponse])
def list_advice(
    category: Optional[str] = None,
    search: Optional[str] = None,
    include_unpublished: bool = False,
    db: Session = Depends(get_db),
):
    """List advice, optionally filtered by category or search"""
    query = db.query(Advice)

    if not include_unpublished:
        query = query.filter(Advice.is_published == True)

    if category and category != "all":
        if category not in VALID_CATEGORIES:
            raise HTTPException(status_code=400, detail="Буруу категори")
        query = query.filter(Advice.category == category)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Advice.title).like(like),
                func.lower(Advice.summary).like(like),
                func.lower(Advice.content).like(like),
            )
        )

    return query.order_by(Advice.sort_order.asc(), Advice.id.desc()).all()


@router.get("/stats", response_model=AdviceStats)
def advice_stats(db: Session = Depends(get_db)):
    """Count per category"""
    total = db.query(Advice).filter(Advice.is_published == True).count()
    counts = {}
    for cat in VALID_CATEGORIES:
        counts[cat] = db.query(Advice).filter(Advice.category == cat, Advice.is_published == True).count()
    return AdviceStats(
        cv=counts["cv"],
        interview=counts["interview"],
        job_search=counts["job_search"],
        career=counts["career"],
        total=total,
    )


@router.get("/{advice_id}", response_model=AdviceResponse)
def get_advice(advice_id: int, db: Session = Depends(get_db)):
    advice = db.query(Advice).filter(Advice.id == advice_id).first()
    if not advice:
        raise HTTPException(status_code=404, detail="Зөвлөмж олдсонгүй")
    return advice


# ---------- Admin CRUD ----------

@router.post("/", response_model=AdviceResponse)
def create_advice(data: AdviceCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Буруу категори")
    advice = Advice(**data.model_dump())
    db.add(advice)
    db.commit()
    db.refresh(advice)
    return advice


@router.put("/{advice_id}", response_model=AdviceResponse)
def update_advice(advice_id: int, data: AdviceCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    advice = db.query(Advice).filter(Advice.id == advice_id).first()
    if not advice:
        raise HTTPException(status_code=404, detail="Зөвлөмж олдсонгүй")
    if data.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Буруу категори")

    for key, val in data.model_dump().items():
        setattr(advice, key, val)
    db.commit()
    db.refresh(advice)
    return advice


@router.delete("/{advice_id}")
def delete_advice(advice_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    advice = db.query(Advice).filter(Advice.id == advice_id).first()
    if not advice:
        raise HTTPException(status_code=404, detail="Зөвлөмж олдсонгүй")
    db.delete(advice)
    db.commit()
    return {"message": "Устгагдлаа"}