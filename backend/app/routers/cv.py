from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import uuid
import aiofiles
import os
import io
import json
import pdfplumber
from groq import Groq

from app.database import get_db
from app.models.user import User
from app.models.cv import CV, Education, WorkExperience, Skill
from app.schemas.cv import CVCreate, CVResponse, CVListResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/cv", tags=["CV"])

ALLOWED_IMAGE_TYPES = {"jpg", "jpeg", "png", "webp"}
ALLOWED_CERT_TYPES = {"pdf", "jpg", "jpeg", "png"}
MAX_PHOTO_BYTES = 5 * 1024 * 1024   # 5 MB
MAX_CERT_BYTES = 10 * 1024 * 1024   # 10 MB
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


_PARSE_PROMPT = """You are a CV parser. Extract all information from this CV text and return ONLY valid JSON.

CV Text:
{cv_text}

Return JSON with this exact structure (use empty string for missing fields, empty arrays for missing lists):
{{
  "first_name": "",
  "last_name": "",
  "email": "",
  "phone": "",
  "address": "",
  "about": "",
  "educations": [
    {{
      "school": "",
      "major": "",
      "level": "",
      "start_year": "",
      "end_year": "",
      "gpa": "",
      "is_current": false
    }}
  ],
  "work_experiences": [
    {{
      "company": "",
      "position": "",
      "start_date": "",
      "end_date": "",
      "is_current": false,
      "description": ""
    }}
  ],
  "skills": [],
  "languages": [
    {{
      "name": "",
      "level": ""
    }}
  ]
}}

Rules:
- For start_date/end_date use YYYY-MM-DD format if possible, otherwise just YYYY-MM or YYYY
- For start_year/end_year use 4-digit year string (e.g. "2022")
- If currently working/studying, set is_current=true and leave end_date/end_year empty
- skills must be an array of plain skill name strings
- Return ONLY the JSON object, no explanation or other text"""


@router.post("/parse-upload")
async def parse_cv_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Зөвхөн PDF файл зөвшөөрнө")

    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Файлын хэмжээ 20MB-аас хэтэрч байна")

    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages_text = [page.extract_text() for page in pdf.pages[:10] if page.extract_text()]
        cv_text = "\n\n".join(pages_text).strip()
    except Exception:
        raise HTTPException(status_code=422, detail="PDF-ээс текст гаргаж авах боломжгүй байна")

    if not cv_text or len(cv_text) < 30:
        raise HTTPException(status_code=422, detail="PDF-д уншигдах текст олдсонгүй. Скан хийсэн PDF байж болно.")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="CV parse үйлчилгээ одоогоор боломжгүй байна")

    client = Groq(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=2048,
            messages=[{"role": "user", "content": _PARSE_PROMPT.format(cv_text=cv_text[:8000])}],
        )
        raw = completion.choices[0].message.content.strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("JSON олдсонгүй")
        result = json.loads(raw[start:end])
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="CV-ийн мэдээллийг задлах боломжгүй байна")
    except Exception as e:
        err_name = type(e).__name__
        err_msg = str(e)
        if "RateLimit" in err_name or "rate_limit" in err_msg.lower() or "429" in err_msg:
            raise HTTPException(status_code=429, detail="Groq API-ийн өдрийн хязгаар дүүрлээ. Маргааш дахин оролдоно уу.")
        raise HTTPException(status_code=502, detail=f"CV уншихад алдаа: {err_msg[:300]}")

    return result


@router.post("/upload-certificate")
async def upload_certificate(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_CERT_TYPES:
        raise HTTPException(status_code=400, detail="Зөвхөн PDF, JPG, PNG форматтай файл оруулна уу")

    contents = await file.read()
    if len(contents) > MAX_CERT_BYTES:
        raise HTTPException(status_code=400, detail="Файлын хэмжээ 10MB-аас хэтрэхгүй байх ёстой")

    if ext == "pdf":
        if not (len(contents) >= 4 and contents[:4] == b"%PDF"):
            raise HTTPException(status_code=400, detail="Файлын агуулга PDF-тэй тохирохгүй байна")
    elif ext in ("jpg", "jpeg"):
        if not (len(contents) >= 3 and contents[:3] == b"\xff\xd8\xff"):
            raise HTTPException(status_code=400, detail="Файлын агуулга зурагтай тохирохгүй байна")
    elif ext == "png":
        if not (len(contents) >= 8 and contents[:8] == b"\x89PNG\r\n\x1a\n"):
            raise HTTPException(status_code=400, detail="Файлын агуулга зурагтай тохирохгүй байна")

    filename = f"cert_{user.id}_{uuid.uuid4().hex}.{ext}"
    dest = UPLOAD_DIR / filename
    async with aiofiles.open(dest, "wb") as f:
        await f.write(contents)

    return {"cert_file_url": f"{API_BASE}/uploads/{filename}"}


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
def get_my_cvs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(CV).filter(CV.user_id == user.id).order_by(CV.created_at.desc()).offset(skip).limit(limit).all()


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