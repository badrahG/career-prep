from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List, Optional
import random

from app.database import get_db
from app.models.interview import InterviewQuestion
from app.models.interview_case import InterviewCase
from app.models.major import Major
from app.models.user import User
from app.models.progress import UserQuizResult, UserFlashcardProgress
from app.schemas.interview import (
    QuestionCreate, QuestionResponse, CategoryStats,
    QuizQuestionPublic, QuizSubmission, QuizResult, QuizResultItem,
    CaseCreate, CaseResponse,
    MajorCreate, MajorResponse,
    OpenEndedMajorStats, OpenEndedSubmission, OpenEndedResult, OpenEndedFeedbackItem,
)
from app.services.auth import get_current_user, get_optional_user
from app.services.usage import ai_limit_check

router = APIRouter(prefix="/api/interview", tags=["Interview"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ")
    return current_user


# ---------- Public endpoints ----------

@router.get("/questions", response_model=List[QuestionResponse])
def get_questions(
    category: Optional[str] = None,
    major_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List all questions for flashcard mode"""
    query = db.query(InterviewQuestion).options(joinedload(InterviewQuestion.major))

    if category and category != "all":
        query = query.filter(InterviewQuestion.category == category)

    if major_id is not None:
        query = query.filter(InterviewQuestion.major_id == major_id)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(InterviewQuestion.question_mn).like(like),
                func.lower(InterviewQuestion.sample_answer).like(like),
            )
        )

    questions = query.order_by(InterviewQuestion.id).offset(skip).limit(limit).all()
    result = []
    for q in questions:
        d = {
            "id": q.id, "question_mn": q.question_mn, "category": q.category,
            "sample_answer": q.sample_answer, "advice": q.advice,
            "difficulty": q.difficulty, "tags": q.tags,
            "case_id": q.case_id, "major_id": q.major_id,
            "major_name": q.major.name if q.major else None,
            "is_quiz": q.is_quiz, "is_open_ended": q.is_open_ended,
            "open_ended_sample": q.open_ended_sample,
            "option_a": q.option_a, "option_b": q.option_b,
            "option_c": q.option_c, "option_d": q.option_d,
            "correct_option": q.correct_option, "explanation": q.explanation,
        }
        result.append(d)
    return result


@router.get("/stats", response_model=CategoryStats)
def get_stats(db: Session = Depends(get_db)):
    """Total count per category (all questions, not quiz-only)"""
    total = db.query(InterviewQuestion).count()
    general = db.query(InterviewQuestion).filter(InterviewQuestion.category == "general").count()
    technical = db.query(InterviewQuestion).filter(InterviewQuestion.category == "technical").count()
    behavioral = db.query(InterviewQuestion).filter(InterviewQuestion.category == "behavioral").count()
    case_count = db.query(InterviewQuestion).filter(InterviewQuestion.category == "case").count()
    return CategoryStats(general=general, technical=technical, behavioral=behavioral, case=case_count, total=total)


@router.get("/questions/{qid}", response_model=QuestionResponse)
def get_question(qid: int, db: Session = Depends(get_db)):
    q = db.query(InterviewQuestion).options(joinedload(InterviewQuestion.major)).filter(InterviewQuestion.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Асуулт олдсонгүй")
    return {
        "id": q.id, "question_mn": q.question_mn, "category": q.category,
        "sample_answer": q.sample_answer, "advice": q.advice,
        "difficulty": q.difficulty, "tags": q.tags,
        "case_id": q.case_id, "major_id": q.major_id,
        "major_name": q.major.name if q.major else None,
        "is_quiz": q.is_quiz, "is_open_ended": q.is_open_ended,
        "open_ended_sample": q.open_ended_sample,
        "option_a": q.option_a, "option_b": q.option_b,
        "option_c": q.option_c, "option_d": q.option_d,
        "correct_option": q.correct_option, "explanation": q.explanation,
    }


# ---------- Quiz endpoints ----------

@router.get("/quiz/questions", response_model=List[QuizQuestionPublic])
def get_quiz_questions(
    category: Optional[str] = None,
    major_id: Optional[int] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Return quiz questions WITHOUT the correct answer.
    Shuffled, limited count.
    """
    query = db.query(InterviewQuestion).options(joinedload(InterviewQuestion.case)).filter(
        InterviewQuestion.is_quiz == True,
        InterviewQuestion.option_a.isnot(None),
        InterviewQuestion.option_b.isnot(None),
        InterviewQuestion.option_c.isnot(None),
        InterviewQuestion.option_d.isnot(None),
        InterviewQuestion.correct_option.isnot(None),
    )

    if category and category != "all":
        query = query.filter(InterviewQuestion.category == category)

    if major_id is not None:
        query = query.filter(InterviewQuestion.major_id == major_id)

    all_questions = query.all()

    # Case асуултуудыг case_id-аар бүлэглэж, бүлэг бүрийг shuffle хийнэ
    case_groups = {}
    non_case = []
    for q in all_questions:
        if q.category == "case" and q.case_id:
            case_groups.setdefault(q.case_id, []).append(q)
        else:
            non_case.append(q)

    ordered = []
    case_group_list = list(case_groups.values())
    random.shuffle(case_group_list)
    for group in case_group_list:
        ordered.extend(group)
    random.shuffle(non_case)
    ordered.extend(non_case)

    selected = ordered[:limit]

    return [
        QuizQuestionPublic(
            id=q.id,
            question_mn=q.question_mn,
            category=q.category.value if hasattr(q.category, "value") else q.category,
            case_id=q.case_id,
            case_title=q.case.title if q.case else None,
            case_text=q.case.case_text if q.case else None,
            option_a=q.option_a or "",
            option_b=q.option_b or "",
            option_c=q.option_c or "",
            option_d=q.option_d or "",
            difficulty=q.difficulty,
        )
        for q in selected
    ]


@router.post("/quiz/submit", response_model=QuizResult)
def submit_quiz(
    submission: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """
    Grade quiz submission and return per-question results with correct answers.
    """
    if not submission.answers:
        raise HTTPException(status_code=400, detail="Хариулт хоосон байна")

    results = []
    correct_count = 0

    for ans in submission.answers:
        q = db.query(InterviewQuestion).filter(InterviewQuestion.id == ans.question_id).first()
        if not q or not q.is_quiz or not q.correct_option:
            continue

        is_correct = ans.selected_option.lower() == q.correct_option.lower()
        if is_correct:
            correct_count += 1

        results.append(QuizResultItem(
            question_id=q.id,
            question_mn=q.question_mn,
            selected_option=ans.selected_option,
            correct_option=q.correct_option,
            is_correct=is_correct,
            explanation=q.explanation,
            option_a=q.option_a or "",
            option_b=q.option_b or "",
            option_c=q.option_c or "",
            option_d=q.option_d or "",
        ))

    total = len(results)
    percentage = round((correct_count / total) * 100) if total > 0 else 0

    if percentage >= 90:
        advice = "Гайхалтай! Та ярилцлагад бэлэн байна. Үргэлжлүүлэн дадлага хийж, шинэ сэдвийн талаар судлаарай."
    elif percentage >= 70:
        advice = "Сайн оноо! Цөөхөн сул талаа буруу хариултуудаас тодорхойлж, тэдгээр сэдвүүдийг дахин судлаарай."
    elif percentage >= 50:
        advice = "Дундаж. Flashcard горимд буцаж үндсэн ойлголтуудыг бэхжүүлж, дахин хийгээрэй."
    else:
        advice = "Түлхэц хэрэгтэй байна. Эхлээд Flashcard горимд бүх асуултыг судлаад, дараа нь Quiz-г дахин туршаарай."

    if current_user and total > 0:
        db.add(UserQuizResult(
            user_id=current_user.id,
            total=total,
            correct=correct_count,
            percentage=percentage,
        ))
        db.commit()

    return QuizResult(
        total=total,
        correct=correct_count,
        percentage=percentage,
        advice=advice,
        results=results,
    )


# ---------- Flashcard progress ----------

@router.get("/progress")
def get_flashcard_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(UserFlashcardProgress).filter(UserFlashcardProgress.user_id == current_user.id).all()
    return {"studied_ids": [r.question_id for r in rows]}


@router.delete("/progress")
def reset_flashcard_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(UserFlashcardProgress).filter(UserFlashcardProgress.user_id == current_user.id).delete()
    db.commit()
    return {"ok": True}


@router.post("/questions/{qid}/viewed")
def mark_question_viewed(qid: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime, timezone
    existing = db.query(UserFlashcardProgress).filter(
        UserFlashcardProgress.user_id == current_user.id,
        UserFlashcardProgress.question_id == qid,
    ).first()
    if not existing:
        db.add(UserFlashcardProgress(user_id=current_user.id, question_id=qid))
    else:
        # Дахин судалсан тохиолдолд viewed_at шинэчилнэ — өнөөдрийн activity-д харагдана
        existing.viewed_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


# ---------- STAR / Behavioral endpoints ----------

@router.get("/behavioral", response_model=List[QuestionResponse])
def get_behavioral_questions(db: Session = Depends(get_db)):
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.category == "behavioral"
    ).all()
    random.shuffle(questions)
    return questions


# ---------- Case endpoints ----------

@router.get("/cases", response_model=List[CaseResponse])
def get_cases(db: Session = Depends(get_db)):
    cases = db.query(InterviewCase).order_by(InterviewCase.id).all()
    result = []
    for c in cases:
        q_count = db.query(InterviewQuestion).filter(InterviewQuestion.case_id == c.id).count()
        result.append(CaseResponse(
            id=c.id,
            title=c.title,
            case_text=c.case_text,
            difficulty=c.difficulty,
            question_count=q_count,
            created_at=c.created_at,
        ))
    return result


@router.post("/cases", response_model=CaseResponse)
def create_case(data: CaseCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    c = InterviewCase(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return CaseResponse(id=c.id, title=c.title, case_text=c.case_text, difficulty=c.difficulty, question_count=0, created_at=c.created_at)


@router.put("/cases/{cid}", response_model=CaseResponse)
def update_case(cid: int, data: CaseCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    c = db.query(InterviewCase).filter(InterviewCase.id == cid).first()
    if not c:
        raise HTTPException(status_code=404, detail="Кейс олдсонгүй")
    for key, val in data.model_dump().items():
        setattr(c, key, val)
    db.commit()
    db.refresh(c)
    q_count = db.query(InterviewQuestion).filter(InterviewQuestion.case_id == c.id).count()
    return CaseResponse(id=c.id, title=c.title, case_text=c.case_text, difficulty=c.difficulty, question_count=q_count, created_at=c.created_at)


@router.delete("/cases/{cid}")
def delete_case(cid: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    c = db.query(InterviewCase).filter(InterviewCase.id == cid).first()
    if not c:
        raise HTTPException(status_code=404, detail="Кейс олдсонгүй")
    db.delete(c)
    db.commit()
    return {"message": "Устгагдлаа"}


# ---------- Admin CRUD ----------

@router.post("/questions", response_model=QuestionResponse)
def create_question(data: QuestionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if data.category not in ("general", "technical", "behavioral", "case"):
        raise HTTPException(status_code=400, detail="Буруу категори")

    # If is_quiz=True, validate quiz fields
    if data.is_quiz:
        if not all([data.option_a, data.option_b, data.option_c, data.option_d, data.correct_option]):
            raise HTTPException(status_code=400, detail="Quiz асуултад 4 сонголт ба зөв хариулт заавал шаардлагатай")
        if data.correct_option.lower() not in ("a", "b", "c", "d"):
            raise HTTPException(status_code=400, detail="Зөв хариулт a/b/c/d байх ёстой")

    q = InterviewQuestion(**data.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    from app.services.notification_service import push_notification
    cat_label = {"general": "Ерөнхий", "technical": "Техникийн", "behavioral": "Зан төлөвийн", "case": "Кейс"}.get(data.category, data.category)
    push_notification(db, "interview_new", f"Шинэ ярилцлагын асуулт нэмэгдлээ", cat_label, "/interview/flashcard")
    return q


@router.put("/questions/{qid}", response_model=QuestionResponse)
def update_question(qid: int, data: QuestionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Асуулт олдсонгүй")
    if data.category not in ("general", "technical", "behavioral", "case"):
        raise HTTPException(status_code=400, detail="Буруу категори")

    if data.is_quiz:
        if not all([data.option_a, data.option_b, data.option_c, data.option_d, data.correct_option]):
            raise HTTPException(status_code=400, detail="Quiz асуултад 4 сонголт ба зөв хариулт заавал шаардлагатай")
        if data.correct_option.lower() not in ("a", "b", "c", "d"):
            raise HTTPException(status_code=400, detail="Зөв хариулт a/b/c/d байх ёстой")

    for key, val in data.model_dump().items():
        setattr(q, key, val)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/questions/{qid}")
def delete_question(qid: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Асуулт олдсонгүй")
    db.delete(q)
    db.commit()
    return {"message": "Устгагдлаа"}


# ---------- Major endpoints ----------

@router.get("/majors", response_model=List[MajorResponse])
def get_majors(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(Major)
    if active_only:
        q = q.filter(Major.is_active == True)
    return q.order_by(Major.name).all()


@router.post("/majors", response_model=MajorResponse)
def create_major(data: MajorCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    existing = db.query(Major).filter(Major.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ийм нэртэй мэргэжил аль хэдийн байна")
    m = Major(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/majors/{mid}", response_model=MajorResponse)
def update_major(mid: int, data: MajorCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    m = db.query(Major).filter(Major.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Мэргэжил олдсонгүй")
    duplicate = db.query(Major).filter(Major.name == data.name, Major.id != mid).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="Ийм нэртэй мэргэжил аль хэдийн байна")
    for key, val in data.model_dump().items():
        setattr(m, key, val)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/majors/{mid}")
def delete_major(mid: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    m = db.query(Major).filter(Major.id == mid).first()
    if not m:
        raise HTTPException(status_code=404, detail="Мэргэжил олдсонгүй")
    db.delete(m)
    db.commit()
    return {"message": "Устгагдлаа"}


# ---------- Open-ended (AI evaluate) endpoints ----------

_EVAL_PROMPT = """Та мэргэжлийн ярилцлагын үнэлгээчин юм. Дараах {n} ярилцлагын асуулт болон хэрэглэгчийн хариултуудыг уншаад Монгол хэлээр нарийн үнэлгээ хийнэ үү.

{qa_list}

Зөвхөн дараах JSON форматаар хариулна уу (өөр текст бичихгүй):
{{
  "results": [
    {{
      "question_id": <асуултын id>,
      "score": <0-10 хооронд бүхэл тоо>,
      "strengths": "<хариулт дахь зөв, сайн талууд — 1-2 өгүүлбэр>",
      "missing": "<дутуу байсан чухал зүйлс — 1-2 өгүүлбэр>",
      "suggestion": "<хэрхэн сайжруулах, нэмж хэлэх ёстой байсан зүйл — 1-2 өгүүлбэр>"
    }}
  ],
  "overall_score": <0-100 хооронд бүхэл тоо>,
  "overall_advice": "<нийт дүгнэлт, цаашид хэрхэн бэлтгэх тухай — 2-3 өгүүлбэр>"
}}"""


def _build_eval_prompt(questions_with_answers: list) -> str:
    import json
    qa_lines = []
    for i, (q, answer) in enumerate(questions_with_answers, 1):
        qa_lines.append(f"Асуулт {i} (id={q.id}): {q.question_mn}")

        qa_lines.append(f"Хэрэглэгчийн хариулт: {answer.strip() or '(хариулаагүй)'}")
        qa_lines.append("")
    return _EVAL_PROMPT.format(n=len(questions_with_answers), qa_list="\n".join(qa_lines))


def _parse_eval_json(raw: str) -> dict:
    import json
    if "```" in raw:
        parts = raw.split("```")
        for part in parts:
            stripped = part.strip()
            if stripped.startswith("json"):
                raw = stripped[4:]
                break
            elif "{" in stripped:
                raw = stripped
                break
    start = raw.find("{")
    end = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("JSON олдсонгүй")
    return json.loads(raw[start:end])


def _evaluate_with_claude(prompt: str, api_key: str) -> dict:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_eval_json(message.content[0].text.strip())


def _evaluate_with_groq(prompt: str, api_key: str) -> dict:
    from groq import Groq
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=3000,
        temperature=0.3,
    )
    return _parse_eval_json(completion.choices[0].message.content.strip())


@router.get("/open-ended/majors", response_model=List[OpenEndedMajorStats])
def get_open_ended_majors(db: Session = Depends(get_db)):
    from sqlalchemy import func
    rows = (
        db.query(Major, func.count(InterviewQuestion.id).label("q_count"))
        .join(InterviewQuestion, (InterviewQuestion.major_id == Major.id) & (InterviewQuestion.is_open_ended == True))
        .filter(Major.is_active == True)
        .group_by(Major.id)
        .order_by(Major.name)
        .all()
    )
    return [
        OpenEndedMajorStats(id=m.id, name=m.name, description=m.description, question_count=count)
        for m, count in rows
    ]


@router.get("/open-ended/questions", response_model=List[QuestionResponse])
def get_open_ended_questions(
    major_id: int = Query(...),
    limit: Optional[int] = Query(None, ge=1, le=30),
    db: Session = Depends(get_db),
):
    questions = (
        db.query(InterviewQuestion)
        .options(joinedload(InterviewQuestion.major))
        .filter(InterviewQuestion.is_open_ended == True, InterviewQuestion.major_id == major_id)
        .all()
    )
    if limit and len(questions) > limit:
        questions = random.sample(questions, limit)
    return [
        {
            "id": q.id, "question_mn": q.question_mn, "category": q.category,
            "sample_answer": q.sample_answer, "advice": q.advice,
            "difficulty": q.difficulty, "tags": q.tags,
            "case_id": q.case_id, "major_id": q.major_id,
            "major_name": q.major.name if q.major else None,
            "is_quiz": q.is_quiz, "is_open_ended": q.is_open_ended,
            "open_ended_sample": q.open_ended_sample,
            "option_a": None, "option_b": None, "option_c": None, "option_d": None,
            "correct_option": None, "explanation": None,
        }
        for q in questions
    ]


@router.post("/evaluate", response_model=OpenEndedResult)
def evaluate_open_ended(
    submission: OpenEndedSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(ai_limit_check(cost=3)),
):
    import os
    if not submission.answers:
        raise HTTPException(status_code=400, detail="Хариулт хоосон байна")

    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    if not api_key and not groq_key:
        raise HTTPException(status_code=503, detail="AI үнэлгээний үйлчилгээ тохируулагдаагүй байна.")

    question_ids = [a.question_id for a in submission.answers]
    questions_map = {
        q.id: q
        for q in db.query(InterviewQuestion).filter(InterviewQuestion.id.in_(question_ids)).all()
    }

    questions_with_answers = [
        (questions_map[a.question_id], a.answer)
        for a in submission.answers
        if a.question_id in questions_map and questions_map[a.question_id].is_open_ended
    ]

    if not questions_with_answers:
        raise HTTPException(status_code=400, detail="Дүгнэх асуулт олдсонгүй")

    prompt = _build_eval_prompt(questions_with_answers)

    try:
        if api_key:
            raw = _evaluate_with_claude(prompt, api_key)
        else:
            raw = _evaluate_with_groq(prompt, groq_key)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI дүгнэхэд алдаа гарлаа: {str(e)[:200]}")

    answer_map = {a.question_id: a.answer for a in submission.answers}
    results = []
    for item in raw.get("results", []):
        qid = item.get("question_id")
        q = questions_map.get(qid)
        if q:
            results.append(OpenEndedFeedbackItem(
                question_id=qid,
                question_mn=q.question_mn,
                user_answer=answer_map.get(qid, ""),
                score=max(0, min(10, int(item.get("score", 0)))),
                strengths=item.get("strengths", ""),
                missing=item.get("missing", ""),
                suggestion=item.get("suggestion", ""),
                open_ended_sample=q.open_ended_sample,
            ))

    return OpenEndedResult(
        overall_score=max(0, min(100, int(raw.get("overall_score", 0)))),
        overall_advice=raw.get("overall_advice", ""),
        results=results,
    )