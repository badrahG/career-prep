from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Any
import os
import json
import anthropic
import deepl
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.cv import CV
from app.services.auth import get_current_user
from app.services.usage import ai_limit_check

router = APIRouter(prefix="/api/cv", tags=["Scholarship CV"])

_COUNTRY_RULES = {
    "United States": {
        "rules": """
US SCHOLARSHIP CV RULES:
- EXCLUDE: photo, gender, age, marital status, nationality, ID number
- EMPHASIZE: GPA, academic honors (Dean's List), leadership roles with quantified impact, community service, extracurricular achievements, compelling personal narrative, clear future goals
- FORMAT: Clean US-style 1-2 page resume, reverse chronological, strong action verbs
- TONE: Confident, achievement-driven, quantified results wherever possible""",
        "extra_label": "Activities & Leadership Summary",
        "extra_instruction": "Write a structured 'Activities & Leadership Summary' in Common App activity format. For each activity include: Position/Role, Organization name, Time commitment (hrs/week and weeks/year), and 2-line impact description. Focus on leadership impact and community contribution. List 5-8 activities.",
    },
    "Australia": {
        "rules": """
AUSTRALIA SCHOLARSHIP CV RULES:
- EXCLUDE: photo, gender, age, marital status
- EMPHASIZE: Academic excellence, leadership development, community contribution, English proficiency with scores, program alignment, future contribution to Australia and home country
- FORMAT: Australian academic CV, 2-3 pages, detailed and evidence-based
- TONE: Professional, evidence-based, forward-looking, clearly addresses selection criteria""",
        "extra_label": "Selection Criteria Response Outline",
        "extra_instruction": "Write a 'Selection Criteria Response Outline' using the STAR method (Situation, Task, Action, Result). Address these 4 standard Australian scholarship criteria with specific examples from the applicant's background: 1) Academic Excellence, 2) Leadership and Communication Skills, 3) Community Involvement and Commitment to Service, 4) Clarity of Purpose and Future Impact. Each criterion response must be 150-200 words using STAR format.",
    },
    "Japan": {
        "rules": """
JAPAN SCHOLARSHIP CV RULES:
- PHOTO: Include note 'Attach passport-size photo if required by the scholarship'
- EMPHASIZE: Academic record (precise, systematic), study plan, why Japan specifically, why this university/lab/professor, Japanese language ability, discipline, contribution after returning home
- FORMAT: Japanese academic CV style — formal, precise dates, systematic numbered sections
- TONE: Formal, respectful yet confident, relationship-oriented (mention academic advisors), future-contribution-focused
- STUDY PLAN IS CRITICAL: The study plan (研究計画書) is the single most important document for Japanese scholarship applications""",
        "extra_label": "Study Plan Draft (研究計画書)",
        "extra_instruction": "Write a detailed formal 'Study Plan Draft (研究計画書)' for a Japanese scholarship application. Must include ALL 6 sections: 1) Research Background & Problem Statement — why this research is necessary and the current state of the field, 2) Research Objectives — clear numbered goals, 3) Research Methodology — specific methods, approaches, and tools, 4) Study Schedule in Japan — semester-by-semester timeline with milestones, 5) Expected Outcomes and Academic Contributions, 6) Future Contribution After Returning Home — specific plans for applying research in home country. Write with academic rigor and formal tone. This section must be comprehensive (500+ words).",
    },
}


class LanguageScore(BaseModel):
    type: str = ""
    score: str = ""


class ProfileData(BaseModel):
    fullName: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    portfolio: str = ""


class EducationData(BaseModel):
    school: str = ""
    degree: str = ""
    major: str = ""
    gpa: str = ""
    gpaScale: str = "4.00"
    graduationYear: str = ""
    coursework: str = ""


class AchievementData(BaseModel):
    awards: str = ""
    competitions: str = ""
    certificates: str = ""
    languageScores: List[LanguageScore] = Field(default_factory=list)


class ScholarshipGenerateRequest(BaseModel):
    country: str = "United States"
    scholarshipName: str = ""
    organization: str = ""
    deadline: str = ""
    program: str = ""
    requirementText: str = ""
    profile: ProfileData = Field(default_factory=ProfileData)
    education: EducationData = Field(default_factory=EducationData)
    achievements: AchievementData = Field(default_factory=AchievementData)
    leadershipExperience: str = ""
    volunteerWork: str = ""
    extracurricular: str = ""
    projects: str = ""
    workExperience: str = ""
    personalBackground: str = ""
    careerGoal: str = ""
    whyScholarship: str = ""
    whyCountry: str = ""
    howContribute: str = ""
    impactPlan: str = ""
    studyPlan: str = ""


def _build_prompt(d: ScholarshipGenerateRequest) -> str:
    cfg = _COUNTRY_RULES[d.country]

    lang_scores = ", ".join(
        f"{ls.type}: {ls.score}" for ls in d.achievements.languageScores if ls.type and ls.score
    ) or "Not provided"

    study_section = ""
    if d.country == "Japan" and d.studyPlan:
        study_section = f"\nAPPLICANT'S STUDY NOTES:\n{d.studyPlan}\n"

    return f"""You are a world-class scholarship application consultant specializing in {d.country} scholarship applications. Generate complete, ready-to-use application materials.

ABSOLUTE RULES:
1. Use ONLY the information explicitly provided. NEVER fabricate GPA, scores, awards, dates, organizations, or experiences.
2. Write entirely in professional English. No Mongolian text in any output.
3. Tailor ALL content specifically to {d.country} and the scholarship provided.
4. If important information is missing, add it to the checklist — never invent it.
5. Use numbers, specific titles, dates, and concrete impact wherever the user provided them.
6. Every output must be complete and ready to use with minimal editing.

{cfg['rules']}

=== APPLICANT DATA ===

SCHOLARSHIP TARGET:
- Scholarship Name: {d.scholarshipName or "Not specified"}
- Organization/University: {d.organization or "Not specified"}
- Program/Major: {d.program or "Not specified"}
- Deadline: {d.deadline or "Not specified"}
- Country: {d.country}

OFFICIAL SCHOLARSHIP REQUIREMENTS:
{d.requirementText if d.requirementText else f"Not provided — apply standard {d.country} scholarship criteria and best practices"}

BASIC PROFILE:
- Full Name: {d.profile.fullName or "Not provided"}
- Email: {d.profile.email or "Not provided"}
- Phone: {d.profile.phone or "Not provided"}
- Location: {d.profile.location or "Not provided"}
- LinkedIn: {d.profile.linkedin or "N/A"}
- Portfolio/GitHub: {d.profile.portfolio or "N/A"}

EDUCATION:
- Institution: {d.education.school or "Not provided"}
- Degree Level: {d.education.degree or "Not provided"}
- Major/Field: {d.education.major or "Not provided"}
- GPA: {d.education.gpa or "Not provided"} / {d.education.gpaScale or "4.00"}
- Graduation: {d.education.graduationYear or "Not provided"}
- Relevant Coursework: {d.education.coursework or "Not provided"}

ACADEMIC ACHIEVEMENTS:
- Awards & Honors: {d.achievements.awards or "Not provided"}
- Competitions & Olympiads: {d.achievements.competitions or "Not provided"}
- Certificates & Training: {d.achievements.certificates or "Not provided"}
- Language Test Scores: {lang_scores}

LEADERSHIP & ACTIVITIES:
- Leadership Roles: {d.leadershipExperience or "Not provided"}
- Volunteer/Community Service: {d.volunteerWork or "Not provided"}
- Extracurricular Activities: {d.extracurricular or "Not provided"}
- Research/Projects: {d.projects or "Not provided"}
- Work/Internship: {d.workExperience or "Not provided"}
- Personal Background: {d.personalBackground or "Not provided"}

GOALS & MOTIVATION:
- Career Goal: {d.careerGoal or "Not provided"}
- Why This Scholarship: {d.whyScholarship or "Not provided"}
- Why {d.country}: {d.whyCountry or "Not provided"}
- Contribution Plan: {d.howContribute or "Not provided"}
- Post-Scholarship Impact: {d.impactPlan or "Not provided"}
{study_section}

=== GENERATE THE FOLLOWING ===

Return a single valid JSON object with exactly these 5 keys:

{{
  "cv": "Complete scholarship CV for {d.country}. Use SECTION HEADERS IN ALL CAPS followed by a line of dashes (---). Include all country-appropriate sections. Professional, achievement-focused, ready to copy and submit.",
  "motivationLetter": "Complete motivation letter / personal statement. 4-5 strong paragraphs. Opening: compelling personal hook that connects background to this scholarship. Body: academic excellence evidence, why this specific scholarship and organization, why {d.country} specifically, how goals align with the scholarship mission, unique value you bring. Closing: strong memorable conclusion with forward-looking statement. Tailored to the specific requirements provided.",
  "extraDraft": "{cfg['extra_label']}. {cfg['extra_instruction']}",
  "checklist": ["Specific actionable missing item 1 — be precise, e.g. 'Provide IELTS or TOEFL score — required for {d.country} scholarship applications'", "Missing item 2", "Add more as needed"],
  "suggestions": ["High-impact suggestion 1 specific to this application and {d.country}", "Suggestion 2", "Suggestion 3"]
}}

Return ONLY the raw JSON object. No markdown code fences (no ```), no preamble, no text after the closing brace."""


def _parse_json_response(raw: str) -> dict:
    """AI хариуг JSON болгон parse хийнэ."""
    # Markdown code fence арилгах
    if "```" in raw:
        raw = raw[raw.find("\n", raw.find("```")) + 1:]
        if "```" in raw:
            raw = raw[:raw.rfind("```")]
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("JSON not found in response")
    chunk = raw[start:end]
    try:
        return json.loads(chunk)
    except json.JSONDecodeError:
        # Literal newline-г escape хийж дахин оролдох
        import re
        fixed = re.sub(r'(?<!\\)\n', r'\\n', chunk)
        return json.loads(fixed)


def _generate_with_claude(prompt: str, api_key: str) -> dict:
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
        max_tokens=6000,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    return _parse_json_response(raw)


def _generate_with_groq(prompt: str, api_key: str) -> dict:
    from groq import Groq
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=8000,
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}],
    )
    raw = completion.choices[0].message.content.strip()
    return _parse_json_response(raw)


@router.post("/scholarship-generate")
async def generate_scholarship_cv(
    data: ScholarshipGenerateRequest,
    current_user: User = Depends(ai_limit_check(cost=1)),
):
    if not data.country or data.country not in _COUNTRY_RULES:
        raise HTTPException(status_code=400, detail="Улс сонгоно уу (United States, Australia, Japan)")

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    if not anthropic_key and not groq_key:
        raise HTTPException(
            status_code=503,
            detail="AI үйлчилгээ тохиргоогүй байна. ANTHROPIC_API_KEY эсвэл GROQ_API_KEY тохируулна уу.",
        )

    prompt = _build_prompt(data)

    try:
        if anthropic_key:
            result = _generate_with_claude(prompt, anthropic_key)
        else:
            result = _generate_with_groq(prompt, groq_key)
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI хариуг боловсруулах боломжгүй байна")
    except anthropic.APIStatusError as e:
        if e.status_code == 400 and "credit" in str(e).lower():
            raise HTTPException(status_code=503, detail="AI үйлчилгээний кредит дууссан байна")
        raise HTTPException(status_code=502, detail="Claude API-тай холбогдоход алдаа гарлаа")
    except anthropic.APIError:
        raise HTTPException(status_code=502, detail="AI generation хийхэд алдаа. Дахин оролдоно уу.")
    except Exception as e:
        err_name = type(e).__name__
        err_msg = str(e)
        if "RateLimit" in err_name or "rate_limit" in err_msg.lower() or "429" in err_msg:
            raise HTTPException(status_code=429, detail="AI API-ийн хязгаар дүүрлээ. Түр хүлээгээд дахин оролдоно уу.")
        raise HTTPException(status_code=502, detail=f"Generation алдаа: {err_msg[:200]}")


class TranslateRequest(BaseModel):
    text: str
    targetLang: str = "JA"


@router.post("/scholarship-translate")
async def translate_scholarship_text(
    data: TranslateRequest,
    current_user: User = Depends(get_current_user),
):
    if not data.text or not data.text.strip():
        raise HTTPException(status_code=400, detail="Орчуулах текст хоосон байна")

    deepl_key = os.getenv("DEEPL_API_KEY")
    if not deepl_key:
        raise HTTPException(status_code=503, detail="Орчуулгын үйлчилгээ тохиргоогүй байна. DEEPL_API_KEY тохируулна уу.")

    target = "JA" if data.targetLang == "JA" else "EN-US"

    try:
        translator = deepl.Translator(deepl_key)
        result = translator.translate_text(data.text[:15000], target_lang=target)
        return {"translatedText": result.text}
    except deepl.AuthorizationException:
        raise HTTPException(status_code=401, detail="DeepL API түлхүүр буруу байна")
    except deepl.QuotaExceededException:
        raise HTTPException(status_code=429, detail="DeepL API-ийн сарын хязгаар дүүрлээ")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Орчуулахад алдаа: {str(e)[:200]}")


class ScholarshipCVSaveRequest(BaseModel):
    name: str
    cvData: Any


@router.post("/scholarship-save")
def save_scholarship_cv(
    data: ScholarshipCVSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cv = CV(
        user_id=current_user.id,
        name=data.name[:200],
        template_type="modern",
        personal_info=json.dumps(data.cvData, ensure_ascii=False),
        cv_type="scholarship",
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return {"id": cv.id, "name": cv.name, "created_at": cv.created_at}


@router.put("/scholarship-save/{cv_id}")
def update_scholarship_cv(
    cv_id: int,
    data: ScholarshipCVSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id, CV.cv_type == "scholarship").first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")
    cv.name = data.name[:200]
    cv.personal_info = json.dumps(data.cvData, ensure_ascii=False)
    db.commit()
    db.refresh(cv)
    return {"id": cv.id, "name": cv.name, "updated_at": cv.updated_at}


@router.get("/scholarship/{cv_id}")
def get_scholarship_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id, CV.cv_type == "scholarship").first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV олдсонгүй")
    try:
        cv_data = json.loads(cv.personal_info) if cv.personal_info else {}
    except Exception:
        cv_data = {}
    return {
        "id": cv.id,
        "name": cv.name,
        "cvData": cv_data,
        "created_at": cv.created_at,
        "updated_at": cv.updated_at,
    }


class FieldsTranslateRequest(BaseModel):
    targetLang: str = "EN"
    values: List[str]


@router.post("/scholarship-translate-fields")
async def translate_scholarship_fields(
    data: FieldsTranslateRequest,
    current_user: User = Depends(get_current_user),
):
    if not data.values:
        return {"translated": []}

    deepl_key = os.getenv("DEEPL_API_KEY")
    if not deepl_key:
        raise HTTPException(status_code=503, detail="Орчуулгын үйлчилгээ тохиргоогүй байна. DEEPL_API_KEY тохируулна уу.")

    target = "JA" if data.targetLang == "JA" else "EN-US"
    non_empty_idx = [i for i, v in enumerate(data.values) if v and v.strip()]
    non_empty_vals = [data.values[i] for i in non_empty_idx]

    translated_map = {}
    if non_empty_vals:
        try:
            translator = deepl.Translator(deepl_key)
            results = translator.translate_text(non_empty_vals, target_lang=target)
            for idx, result in zip(non_empty_idx, results):
                translated_map[idx] = result.text
        except deepl.AuthorizationException:
            raise HTTPException(status_code=401, detail="DeepL API түлхүүр буруу байна")
        except deepl.QuotaExceededException:
            raise HTTPException(status_code=429, detail="DeepL API-ийн сарын хязгаар дүүрлээ")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Орчуулахад алдаа: {str(e)[:200]}")

    return {
        "translated": [translated_map.get(i, data.values[i]) for i in range(len(data.values))]
    }
