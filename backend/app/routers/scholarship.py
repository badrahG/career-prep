from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.scholarship import Scholarship
from app.models.user import User
from app.services.auth import get_current_user
from pydantic import BaseModel

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

    class Config:
        from_attributes = True


@router.get("", response_model=List[ScholarshipResponse])
def get_scholarships(
    target: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Scholarship)
    if target:
        query = query.filter(Scholarship.target == target)
    return query.order_by(Scholarship.deadline).offset(skip).limit(limit).all()


@router.get("/{sid}", response_model=ScholarshipResponse)
def get_scholarship(sid: int, db: Session = Depends(get_db)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Олдсонгүй")
    return s


@router.post("", response_model=ScholarshipResponse)
def create_scholarship(data: ScholarshipCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    s = Scholarship(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
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
    return s


@router.delete("/{sid}")
def delete_scholarship(sid: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    s = db.query(Scholarship).filter(Scholarship.id == sid).first()
    if not s:
        raise HTTPException(status_code=404, detail="Олдсонгүй")
    db.delete(s)
    db.commit()
    return {"message": "Устгагдлаа"}