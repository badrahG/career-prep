from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MajorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True


class MajorResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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
    major_id: Optional[int] = None
    # Quiz fields
    is_quiz: Optional[bool] = False
    is_open_ended: Optional[bool] = False
    open_ended_sample: Optional[str] = None
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
    major_id: Optional[int] = None
    major_name: Optional[str] = None
    is_quiz: bool = False
    is_open_ended: bool = False
    open_ended_sample: Optional[str] = None
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


class OpenEndedMajorStats(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    question_count: int


class OpenEndedAnswer(BaseModel):
    question_id: int
    answer: str


class OpenEndedSubmission(BaseModel):
    major_id: int
    answers: List[OpenEndedAnswer]


class OpenEndedFeedbackItem(BaseModel):
    question_id: int
    question_mn: str
    user_answer: str
    score: int
    strengths: str
    missing: str
    suggestion: str
    open_ended_sample: Optional[str] = None


class OpenEndedResult(BaseModel):
    overall_score: int
    overall_advice: str
    results: List[OpenEndedFeedbackItem]
