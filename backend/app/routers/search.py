from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from app.database import get_db
from app.models.advice import Advice
from app.models.scholarship import Scholarship
from app.models.interview import InterviewQuestion
from app.services.auth import get_optional_user

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("")
def global_search(
    q: str = Query("", min_length=0),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    q = q.strip()
    if not q or len(q) < 2:
        return {"results": []}

    pattern = f"%{q}%"
    results = []

    advices = (
        db.query(Advice)
        .filter(
            Advice.is_published == True,
            or_(Advice.title.ilike(pattern), Advice.summary.ilike(pattern)),
        )
        .limit(5)
        .all()
    )
    for a in advices:
        results.append({
            "type": "advice",
            "id": a.id,
            "title": a.title,
            "subtitle": a.summary[:80] if a.summary else "",
            "url": f"/advice/detail/{a.id}",
            "category": a.category,
        })

    scholarships = (
        db.query(Scholarship)
        .filter(
            or_(
                Scholarship.name.ilike(pattern),
                Scholarship.organization.ilike(pattern),
            )
        )
        .limit(5)
        .all()
    )
    for s in scholarships:
        results.append({
            "type": "scholarship",
            "id": s.id,
            "title": s.name,
            "subtitle": s.organization or "",
            "url": f"/scholarship/{s.id}",
            "category": "scholarship",
        })

    questions = (
        db.query(InterviewQuestion)
        .filter(InterviewQuestion.question_mn.ilike(pattern))
        .limit(5)
        .all()
    )
    for iq in questions:
        results.append({
            "type": "interview",
            "id": iq.id,
            "title": iq.question_mn[:120],
            "subtitle": iq.category,
            "url": "/interview/flashcard",
            "category": iq.category,
        })

    return {"results": results}
