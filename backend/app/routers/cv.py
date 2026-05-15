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
import deepl

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


_MN_TRANSLIT = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v',
    'Г': 'G', 'г': 'g', 'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e',
    'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j', 'З': 'Z', 'з': 'z',
    'И': 'I', 'и': 'i', 'Й': 'I', 'й': 'i', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n',
    'О': 'O', 'о': 'o', 'Ө': 'O', 'ө': 'o', 'П': 'P', 'п': 'p',
    'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't',
    'У': 'U', 'у': 'u', 'Ү': 'U', 'ү': 'u', 'Ф': 'F', 'ф': 'f',
    'Х': 'Kh', 'х': 'kh', 'Ц': 'Ts', 'ц': 'ts', 'Ч': 'Ch', 'ч': 'ch',
    'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Shch', 'щ': 'shch', 'Ъ': '', 'ъ': '',
    'Ы': 'I', 'ы': 'i', 'Ь': '', 'ь': '', 'Э': 'E', 'э': 'e',
    'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
}

def _transliterate(text: str) -> str:
    if not text:
        return text
    return ''.join(_MN_TRANSLIT.get(ch, ch) for ch in text)


@router.post("/{cv_id}/translate")
def translate_cv(cv_id: int, lang: str = Query(default="en"), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")

    api_key = os.getenv("DEEPL_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Орчуулгын үйлчилгээ тохиргоогүй байна")

    try:
        info = json.loads(cv.personal_info) if cv.personal_info else {}
    except Exception:
        info = {}

    exp_list = list(cv.experiences)
    edu_list = list(cv.educations)
    skill_list = list(cv.skills)
    awards = info.get("awards", [])
    personal_skills = info.get("personalSkills", [])
    tech_skills = info.get("techSkills", [])
    prof_skills = info.get("profSkills", [])
    art_skills = info.get("artSkills", [])
    sport_skills = info.get("sportSkills", [])
    internships = info.get("internships", [])
    certs = info.get("certs", [])

    languages = info.get("languages", [])

    slots = [
        ("about", info.get("about", "")),
        ("address", info.get("address", "")),
        ("position", info.get("position", "")),
        ("gender", info.get("gender", "")),
        ("marital", info.get("marital", "")),
    ]
    for i, lang in enumerate(languages):
        slots.append((f"lang_name_{i}", lang.get("name", "")))
        slots.append((f"lang_level_{i}", lang.get("level", "")))
    for i, exp in enumerate(exp_list):
        slots.append((f"exp_pos_{i}", exp.position or ""))
        slots.append((f"exp_company_{i}", exp.company or ""))
        slots.append((f"exp_desc_{i}", exp.description or ""))
    for i, edu in enumerate(edu_list):
        slots.append((f"edu_school_{i}", edu.school or ""))
        slots.append((f"edu_major_{i}", edu.major or ""))
    for i, s in enumerate(skill_list):
        slots.append((f"skill_{i}", s.skill_name or ""))
    for i, a in enumerate(awards):
        slots.append((f"award_{i}", a.get("name", "")))
    for i, s in enumerate(personal_skills):
        slots.append((f"pskill_{i}", s))
    for i, s in enumerate(tech_skills):
        slots.append((f"tskill_{i}", s))
    for i, s in enumerate(prof_skills):
        slots.append((f"prskill_{i}", s))
    for i, s in enumerate(art_skills):
        slots.append((f"askill_{i}", s))
    for i, s in enumerate(sport_skills):
        slots.append((f"spskill_{i}", s))
    for i, n in enumerate(internships):
        slots.append((f"intern_title_{i}", n.get("title", "")))
        slots.append((f"intern_company_{i}", n.get("company", "")))
        slots.append((f"intern_desc_{i}", n.get("description", "")))
    for i, c in enumerate(certs):
        slots.append((f"cert_{i}", c.get("name", "")))
        slots.append((f"cert_org_{i}", c.get("organization", "")))

    to_translate_idx = [i for i, (_, t) in enumerate(slots) if t.strip()]
    to_translate = [slots[i][1] for i in to_translate_idx]

    deepl_lang = "JA" if lang == "ja" else "EN-US"

    translated_texts = {}
    if to_translate:
        try:
            translator = deepl.Translator(api_key)
            results = translator.translate_text(to_translate, target_lang=deepl_lang)
            for idx, result in zip(to_translate_idx, results):
                translated_texts[slots[idx][0]] = result.text
        except deepl.AuthorizationException:
            raise HTTPException(status_code=401, detail="DeepL API түлхүүр буруу байна")
        except deepl.QuotaExceededException:
            raise HTTPException(status_code=429, detail="DeepL API-ийн сарын хязгаар дүүрлээ")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Орчуулахад алдаа: {str(e)[:200]}")

    def t(key, fallback=""):
        return translated_texts.get(key, fallback)

    translated_info = {**info}
    translated_info["about"] = t("about", info.get("about", ""))
    translated_info["firstName"] = _transliterate(info.get("firstName", ""))
    translated_info["lastName"] = _transliterate(info.get("lastName", ""))
    translated_info["address"] = t("address", info.get("address", ""))
    translated_info["position"] = t("position", info.get("position", ""))
    translated_info["gender"] = t("gender", info.get("gender", ""))
    translated_info["marital"] = t("marital", info.get("marital", ""))
    translated_info["languages"] = [
        {**lang, "name": t(f"lang_name_{i}", lang.get("name", "")), "level": t(f"lang_level_{i}", lang.get("level", ""))}
        for i, lang in enumerate(languages)
    ]
    translated_info["awards"] = [
        {**a, "name": t(f"award_{i}", a.get("name", ""))} for i, a in enumerate(awards)
    ]
    translated_info["personalSkills"] = [t(f"pskill_{i}", s) for i, s in enumerate(personal_skills)]
    translated_info["techSkills"] = [t(f"tskill_{i}", s) for i, s in enumerate(tech_skills)]
    translated_info["profSkills"] = [t(f"prskill_{i}", s) for i, s in enumerate(prof_skills)]
    translated_info["artSkills"] = [t(f"askill_{i}", s) for i, s in enumerate(art_skills)]
    translated_info["sportSkills"] = [t(f"spskill_{i}", s) for i, s in enumerate(sport_skills)]
    translated_info["internships"] = [
        {
            **n,
            "title": t(f"intern_title_{i}", n.get("title", "")),
            "company": t(f"intern_company_{i}", n.get("company", "")),
            "description": t(f"intern_desc_{i}", n.get("description", "")),
        }
        for i, n in enumerate(internships)
    ]
    translated_info["certs"] = [
        {**c, "name": t(f"cert_{i}", c.get("name", "")), "organization": t(f"cert_org_{i}", c.get("organization", ""))}
        for i, c in enumerate(certs)
    ]

    return {
        "id": cv.id,
        "name": cv.name,
        "template_type": cv.template_type,
        "personal_info": json.dumps(translated_info),
        "educations": [
            {
                "school": t(f"edu_school_{i}", edu.school or ""),
                "major": t(f"edu_major_{i}", edu.major or ""),
                "start_year": edu.start_year,
                "end_year": edu.end_year,
                "gpa": edu.gpa,
            }
            for i, edu in enumerate(edu_list)
        ],
        "experiences": [
            {
                "company": t(f"exp_company_{i}", exp.company or ""),
                "position": t(f"exp_pos_{i}", exp.position or ""),
                "start_date": exp.start_date,
                "end_date": exp.end_date,
                "description": t(f"exp_desc_{i}", exp.description or ""),
            }
            for i, exp in enumerate(exp_list)
        ],
        "skills": [
            {"skill_name": t(f"skill_{i}", s.skill_name or ""), "level": s.level}
            for i, s in enumerate(skill_list)
        ],
    }