from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import random

from app.database import get_db
from app.models.interview import InterviewQuestion
from app.models.user import User
from app.models.progress import UserQuizResult, UserFlashcardProgress
from app.schemas.interview import (
    QuestionCreate, QuestionResponse, CategoryStats,
    QuizQuestionPublic, QuizSubmission, QuizResult, QuizResultItem,
)
from app.services.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/api/interview", tags=["Interview"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ")
    return current_user


# ---------- Public endpoints ----------

@router.get("/questions", response_model=List[QuestionResponse])
def get_questions(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List all questions for flashcard mode"""
    query = db.query(InterviewQuestion)

    if category and category != "all":
        query = query.filter(InterviewQuestion.category == category)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(InterviewQuestion.question_mn).like(like),
                func.lower(InterviewQuestion.sample_answer).like(like),
            )
        )

    return query.order_by(InterviewQuestion.id).offset(skip).limit(limit).all()


@router.get("/stats", response_model=CategoryStats)
def get_stats(db: Session = Depends(get_db)):
    """Total count per category (all questions, not quiz-only)"""
    total = db.query(InterviewQuestion).count()
    general = db.query(InterviewQuestion).filter(InterviewQuestion.category == "general").count()
    technical = db.query(InterviewQuestion).filter(InterviewQuestion.category == "technical").count()
    behavioral = db.query(InterviewQuestion).filter(InterviewQuestion.category == "behavioral").count()
    return CategoryStats(general=general, technical=technical, behavioral=behavioral, total=total)


@router.get("/questions/{qid}", response_model=QuestionResponse)
def get_question(qid: int, db: Session = Depends(get_db)):
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Асуулт олдсонгүй")
    return q


# ---------- Quiz endpoints ----------

@router.get("/quiz/questions", response_model=List[QuizQuestionPublic])
def get_quiz_questions(
    category: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Return quiz questions WITHOUT the correct answer.
    Shuffled, limited count.
    """
    query = db.query(InterviewQuestion).filter(
        InterviewQuestion.is_quiz == True,
        InterviewQuestion.option_a.isnot(None),
        InterviewQuestion.option_b.isnot(None),
        InterviewQuestion.option_c.isnot(None),
        InterviewQuestion.option_d.isnot(None),
        InterviewQuestion.correct_option.isnot(None),
    )

    if category and category != "all":
        query = query.filter(InterviewQuestion.category == category)

    all_questions = query.all()
    random.shuffle(all_questions)
    return all_questions[:limit]


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
    """Get only behavioral questions for STAR practice mode"""
    return db.query(InterviewQuestion).filter(
        InterviewQuestion.category == "behavioral"
    ).order_by(InterviewQuestion.id).all()


# ---------- Admin CRUD ----------

@router.post("/questions", response_model=QuestionResponse)
def create_question(data: QuestionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if data.category not in ("general", "technical", "behavioral"):
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
    return q


@router.put("/questions/{qid}", response_model=QuestionResponse)
def update_question(qid: int, data: QuestionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    q = db.query(InterviewQuestion).filter(InterviewQuestion.id == qid).first()
    if not q:
        raise HTTPException(status_code=404, detail="Асуулт олдсонгүй")
    if data.category not in ("general", "technical", "behavioral"):
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