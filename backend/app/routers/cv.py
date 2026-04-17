from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import base64
import os
from app.database import get_db
from app.models.user import User
from app.models.cv import CV, Education, WorkExperience, Skill
from app.schemas.cv import CVCreate, CVResponse, CVListResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/cv", tags=["CV"])

@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    contents = await file.read()
    b64 = base64.b64encode(contents).decode("utf-8")
    ext = file.filename.split(".")[-1].lower()
    data_url = f"data:image/{ext};base64,{b64}"
    return {"photo_url": data_url}

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