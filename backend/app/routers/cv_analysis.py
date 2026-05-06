import os
import io
import json
import anthropic
import pdfplumber
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/cv-analysis", tags=["CV Analysis"])

MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB

_PROMPT = """Та CV анализ хийдэг мэргэжилтэн юм. Дараах CV-ийн текстийг уншаад Монгол хэлээр дэлгэрэнгүй дүн шинжилгээ хийнэ үү.

CV текст:
{cv_text}

Дараах JSON форматаар хариулна уу (зөвхөн JSON, өөр юм бичихгүй):
{{
  "score": <0-100 хооронд бүхэл тоо>,
  "grade": "<'Маш муу' эсвэл 'Муу' эсвэл 'Дунд' эсвэл 'Сайн' эсвэл 'Маш сайн'>",
  "summary": "<2-3 өгүүлбэрийн ерөнхий дүгнэлт>",
  "strengths": ["<давуу тал 1>", "<давуу тал 2>"],
  "weaknesses": ["<сул тал 1>", "<сул тал 2>"],
  "missing_sections": ["<дутуу хэсэг нэр>"],
  "recommendations": ["<тодорхой зөвлөмж 1>", "<тодорхой зөвлөмж 2>", "<тодорхой зөвлөмж 3>"],
  "sections": {{
    "contact": {{"present": true, "score": 8, "feedback": "<холбоо барих мэдээллийн талаар санал>"}},
    "summary": {{"present": false, "score": 0, "feedback": "<товч танилцуулгын талаар санал>"}},
    "experience": {{"present": true, "score": 7, "feedback": "<ажлын туршлагын талаар санал>"}},
    "education": {{"present": true, "score": 9, "feedback": "<боловсролын талаар санал>"}},
    "skills": {{"present": true, "score": 6, "feedback": "<ур чадварын талаар санал>"}}
  }}
}}"""


@router.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Зөвхөн PDF файл зөвшөөрнө")

    data = await file.read()
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(status_code=400, detail="Файлын хэмжээ 10MB-аас хэтэрч байна")

    # PDF-ээс текст гаргаж авах
    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages_text = []
            for page in pdf.pages[:10]:  # max 10 хуудас
                text = page.extract_text()
                if text:
                    pages_text.append(text)
        cv_text = "\n\n".join(pages_text).strip()
    except Exception:
        raise HTTPException(status_code=422, detail="PDF-ээс текст гаргаж авах боломжгүй байна")

    if not cv_text or len(cv_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="PDF-д уншигдах текст олдсонгүй. Скан хийсэн PDF байж болно.",
        )

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="CV анализ одоогоор боломжгүй байна")

    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": _PROMPT.format(cv_text=cv_text[:6000]),
                }
            ],
        )
        raw = message.content[0].text.strip()

        # JSON хэсгийг олж авах
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start == -1 or end == 0:
            raise ValueError("JSON олдсонгүй")
        result = json.loads(raw[start:end])
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Анализын хариуг задлах боломжгүй байна")
    except anthropic.APIStatusError as e:
        if e.status_code == 400 and "credit" in str(e).lower():
            raise HTTPException(status_code=503, detail="CV анализ үйлчилгээний кредит дууссан байна. Удахгүй сэргээгдэх болно.")
        raise HTTPException(status_code=502, detail="Claude API-тай холбогдоход алдаа гарлаа. Дахин оролдоно уу.")
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="CV анализ хийхэд алдаа гарлаа. Дахин оролдоно уу.")

    return result
