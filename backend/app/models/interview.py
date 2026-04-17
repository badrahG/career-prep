from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Boolean
from sqlalchemy.sql import func
import enum

from app.database import Base


class QuestionCategory(str, enum.Enum):
    general = "general"
    technical = "technical"
    behavioral = "behavioral"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_mn = Column(Text, nullable=False)
    category = Column(Enum(QuestionCategory), nullable=False)
    sample_answer = Column(Text, nullable=True)
    advice = Column(Text, nullable=True)
    difficulty = Column(String(20), nullable=True, default="medium")
    tags = Column(String(255), nullable=True)

    # Quiz-specific fields
    is_quiz = Column(Boolean, default=False, nullable=False)
    option_a = Column(Text, nullable=True)
    option_b = Column(Text, nullable=True)
    option_c = Column(Text, nullable=True)
    option_d = Column(Text, nullable=True)
    correct_option = Column(String(1), nullable=True)  # "a" | "b" | "c" | "d"
    explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())