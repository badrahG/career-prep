from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import uuid
import aiofiles
import os

from app.database import get_db
from app.models.user import User
from app.models.cv import CV, Education, WorkExperience, Skill
from app.schemas.cv import CVCreate, CVResponse, CVListResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/cv", tags=["CV"])

ALLOWED_IMAGE_TYPES = {"jpg", "jpeg", "png", "webp"}
MAX_PHOTO_BYTES = 5 * 1024 * 1024  # 5 MB
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8001")


def _verify_image_magic(data: bytes, ext: str) -> bool:
    if ext in ("jpg", "jpeg"):
        return len(data) >= 3 and data[:3] == b"\xff\xd8\xff"
    if ext == "png":
        return len(data) >= 8 and data[:8] == b"\x89PNG\r\n\x1a\n"
    if ext == "webp":
        return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False


@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Зөвхөн jpg, jpeg, png, webp форматтай зураг оруулна уу")

    contents = await file.read()
    if len(contents) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=400, detail="Зургийн хэмжээ 5MB-аас хэтрэхгүй байх ёстой")
    if not _verify_image_magic(contents, ext):
        raise HTTPException(status_code=400, detail="Файлын агуулга зурагтай тохирохгүй байна")

    filename = f"{user.id}_{uuid.uuid4().hex}.{ext}"
    dest = UPLOAD_DIR / filename
    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)

    return {"photo_url": f"{API_BASE}/uploads/{filename}"}

@router.post("", response_model=CVResponse)
def create_cv(data: CVCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cv = CV(
        user_id=user.id,
        name=data.name,
        template_type=data.template_type,
        personal_info=data.personal_info,
    )
    db.add(cv)
    db.flush()

    for edu in data.educations:
        db.add(Education(cv_id=cv.id, **edu.model_dump()))
    for exp in data.experiences:
        db.add(WorkExperience(cv_id=cv.id, **exp.model_dump()))
    for skill in data.skills:
        db.add(Skill(cv_id=cv.id, **skill.model_dump()))

    db.commit()
    db.refresh(cv)
    return cv


@router.get("", response_model=List[CVListResponse])
def get_my_cvs(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(CV).filter(CV.user_id == user.id).order_by(CV.created_at.desc()).all()


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(cv_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")
    return cv


@router.put("/{cv_id}", response_model=CVResponse)
def update_cv(cv_id: int, data: CVCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")

    # Update CV fields
    cv.name = data.name
    cv.template_type = data.template_type
    cv.personal_info = data.personal_info

    # Delete existing children and recreate (simplest, consistent approach)
    db.query(Education).filter(Education.cv_id == cv.id).delete()
    db.query(WorkExperience).filter(WorkExperience.cv_id == cv.id).delete()
    db.query(Skill).filter(Skill.cv_id == cv.id).delete()
    db.flush()

    for edu in data.educations:
        db.add(Education(cv_id=cv.id, **edu.model_dump()))
    for exp in data.experiences:
        db.add(WorkExperience(cv_id=cv.id, **exp.model_dump()))
    for skill in data.skills:
        db.add(Skill(cv_id=cv.id, **skill.model_dump()))

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}")
def delete_cv(cv_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")
    db.delete(cv)
    db.commit()
    return {"message": "CV устгагдлаа"}