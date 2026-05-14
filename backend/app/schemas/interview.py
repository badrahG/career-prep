from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CaseCreate(BaseModel):
    title: str
    case_text: str
    difficulty: Optional[str] = "medium"


class CaseResponse(BaseModel):
    id: int
    title: str
    case_text: str
    difficulty: Optional[str] = None
    question_count: Optional[int] = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question_mn: str
    category: str
    sample_answer: Optional[str] = None
    advice: Optional[str] = None
    difficulty: Optional[str] = "medium"
    tags: Optional[str] = None
    case_id: Optional[int] = None
    # Quiz fields
    is_quiz: Optional[bool] = False
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None


class QuestionResponse(BaseModel):
    id: int
    question_mn: str
    category: str
    sample_answer: Optional[str] = None
    advice: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[str] = None
    case_id: Optional[int] = None
    is_quiz: bool = False
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True


class QuizQuestionPublic(BaseModel):
    """Quiz question WITHOUT the correct answer — for user to answer"""
    id: int
    question_mn: str
    category: str
    case_id: Optional[int] = None
    case_title: Optional[str] = None
    case_text: Optional[str] = None
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    difficulty: Optional[str] = None

    class Config:
        from_attributes = True


class QuizAnswer(BaseModel):
    question_id: int
    selected_option: str  # "a" | "b" | "c" | "d"


class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]


class QuizResultItem(BaseModel):
    question_id: int
    question_mn: str
    selected_option: str
    correct_option: str
    is_correct: bool
    explanation: Optional[str] = None
    option_a: str
    option_b: str
    option_c: str
    option_d: str


class QuizResult(BaseModel):
    total: int
    correct: int
    percentage: int
    advice: str
    results: List[QuizResultItem]


class CategoryStats(BaseModel):
    general: int
    technical: int
    behavioral: int
    case: int
    total: int
