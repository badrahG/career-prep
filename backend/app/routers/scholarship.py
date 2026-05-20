from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import json

from app.database import get_db
from app.models.scholarship import Scholarship
from app.models.scholarship_checklist import UserScholarshipChecklist
from app.models.scholarship_bookmark import ScholarshipBookmark
from app.models.user import User
from app.services.auth import get_current_user
from app.services.cache import cache_get, cache_set, cache_clear_prefix
from pydantic import BaseModel

_SCHOLARSHIP_TTL = 300  # 5 минут

router = APIRouter(prefix="/api/scholarship", tags=["Scholarship"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ")
    return current_user


class ScholarshipCreate(BaseModel):
    name: str
    organization: Optional[str] = None
    target: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[date] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    gpa: Optional[str] = None
    duration: Optional[str] = None
    directions: Optional[str] = None
    opportunities: Optional[str] = None
    notes: Optional[str] = None


class ScholarshipResponse(BaseModel):
    id: int
    name: str
    organization: Optional[str] = None
    target: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[date] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    gpa: Optional[str] = None
    duration: Optional[str] = None
    directions: Optional[str] = None
    opportunities: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/bookmarks")
def get_bookmarks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(ScholarshipBookmark).filter(ScholarshipBookmark.user_id == current_user.id).all()
    return {"ids": [r.scholarship_id for r in rows]}


@router.post("/{sid}/bookmark")
def toggle_bookmark(sid: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Тэтгэлэг олдсонгүй")
    existing = db.query(ScholarshipBookmark).filter(
        ScholarshipBookmark.user_id == current_user.id,
        ScholarshipBookmark.scholarship_id == sid,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False}
    db.add(ScholarshipBookmark(user_id=current_user.id, scholarship_id=sid))
    db.commit()
    return {"bookmarked": True}


@router.get("", response_model=List[ScholarshipResponse])
def get_scholarships(
    target: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    cache_key = f"scholarships:{target}:{skip}:{limit}"
    cached = cache_get(cache_key, _SCHOLARSHIP_TTL)
    if cached is not None:
        return cached
    query = db.query(Scholarship)
    if target:
        query = query.filter(Scholarship.target == target)
    result = query.order_by(Scholarship.deadline).offset(skip).limit(limit).all()
    cache_set(cache_key, result)
    return result


@router.get("/{sid}", response_model=ScholarshipResponse)
def get_scholarship(sid: int, db: Session = Depends(get_db)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Олдсонгүй")
    return s


@router.post("", response_model=ScholarshipResponse)
def create_scholarship(data: ScholarshipCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    from app.services.notification_service import push_notification
    s = Scholarship(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    cache_clear_prefix("scholarships:")
    push_notification(db, "scholarship_new", f"Шинэ тэтгэлэг нэмэгдлээ: {s.name}", s.organization or "", f"/scholarship/{s.id}")
    return s


@router.put("/{sid}", response_model=ScholarshipResponse)
def update_scholarship(sid: int, data: ScholarshipCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Олдсонгүй")
    for key, val in data.model_dump().items():
        setattr(s, key, val)
    db.commit()
    db.refresh(s)
    cache_clear_prefix("scholarships:")
    return s


@router.delete("/{sid}")
def delete_scholarship(sid: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Олдсонгүй")
    db.delete(s)
    db.commit()
    cache_clear_prefix("scholarships:")
    return {"message": "Устгагдлаа"}


class ChecklistItem(BaseModel):
    label: str
    done: bool


class ChecklistUpdate(BaseModel):
    items: List[ChecklistItem]


@router.get("/{sid}/checklist")
def get_checklist(sid: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = db.query(UserScholarshipChecklist).filter(
        UserScholarshipChecklist.user_id == current_user.id,
        UserScholarshipChecklist.scholarship_id == sid,
    ).first()
    if not record:
        return {"items": None}
    return {"items": json.loads(record.items)}


@router.put("/{sid}/checklist")
def save_checklist(sid: int, data: ChecklistUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items_json = json.dumps([item.model_dump() for item in data.items], ensure_ascii=False)
    record = db.query(UserScholarshipChecklist).filter(
        UserScholarshipChecklist.user_id == current_user.id,
        UserScholarshipChecklist.scholarship_id == sid,
    ).first()
    if record:
        record.items = items_json
    else:
        record = UserScholarshipChecklist(
            user_id=current_user.id,
            scholarship_id=sid,
            items=items_json,
        )
        db.add(record)
    db.commit()
    return {"ok": True}