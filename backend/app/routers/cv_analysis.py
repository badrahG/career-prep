import os
import io
import json
import pdfplumber
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.models.user import User
from app.services.auth import get_current_user
from app.services.usage import ai_limit_check

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


def _parse_json(raw: str) -> dict:
    # markdown code block-г хасна
    if "```" in raw:
        raw = raw.split("```")[-2] if raw.count("```") >= 2 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("JSON олдсонгүй")
    return json.loads(raw[start:end])


def _analyze_with_claude(cv_text: str, api_key: str) -> dict:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            messages=[{"role": "user", "content": _PROMPT.format(cv_text=cv_text[:6000])}],
        )
        raw = message.content[0].text.strip()
        print(f"[CLAUDE RAW] {raw[:500]}")
        return _parse_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"[CLAUDE JSON ERROR] {e}")
        raise HTTPException(status_code=502, detail="Анализын хариуг задлах боломжгүй байна")
    except anthropic.APIStatusError as e:
        if e.status_code == 400 and "credit" in str(e).lower():
            raise HTTPException(status_code=503, detail="CV анализ үйлчилгээний кредит дууссан байна.")
        raise HTTPException(status_code=502, detail=f"Claude API алдаа: {str(e)[:200]}")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"CV анализ хийхэд алдаа гарлаа: {str(e)[:200]}")


def _analyze_with_groq(cv_text: str, api_key: str) -> dict:
    from groq import Groq
    client = Groq(api_key=api_key)
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": _PROMPT.format(cv_text=cv_text[:6000])}],
            max_tokens=2048,
            temperature=0.3,
        )
        return _parse_json(completion.choices[0].message.content.strip())
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Анализын хариуг задлах боломжгүй байна")
    except Exception as e:
        err = str(e)
        err_lower = err.lower()
        if "ratelimit" in err_lower or "rate_limit" in err_lower or "429" in err_lower:
            raise HTTPException(status_code=429, detail="Groq API-ийн хязгаар дүүрлээ. Түр хүлээгээд дахин оролдоно уу.")
        raise HTTPException(status_code=502, detail=f"Groq алдаа: {err[:300]}")


@router.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(ai_limit_check(cost=1)),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Зөвхөн PDF файл зөвшөөрнө")

    data = await file.read()
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(status_code=400, detail="Файлын хэмжээ 10MB-аас хэтэрч байна")

    try:
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            pages_text = [page.extract_text() for page in pdf.pages[:10]]
        cv_text = "\n\n".join(t for t in pages_text if t).strip()
    except Exception:
        raise HTTPException(status_code=422, detail="PDF-ээс текст гаргаж авах боломжгүй байна")

    if not cv_text or len(cv_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="PDF-д уншигдах текст олдсонгүй. Скан хийсэн PDF байж болно.",
        )

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    if anthropic_key:
        return _analyze_with_claude(cv_text, anthropic_key)
    elif groq_key:
        return _analyze_with_groq(cv_text, groq_key)
    else:
        raise HTTPException(status_code=503, detail="CV анализ одоогоор боломжгүй байна")
