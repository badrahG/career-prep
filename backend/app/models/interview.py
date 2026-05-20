from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship as sa_relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class QuestionCategory(str, enum.Enum):
    general = "general"
    technical = "technical"
    behavioral = "behavioral"
    case = "case"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_mn = Column(Text, nullable=False)
    category = Column(Enum(QuestionCategory, native_enum=False), nullable=False)
    sample_answer = Column(Text, nullable=True)
    advice = Column(Text, nullable=True)
    difficulty = Column(String(20), nullable=True, default="medium")
    tags = Column(String(255), nullable=True)
    case_id = Column(Integer, ForeignKey("interview_cases.id", ondelete="SET NULL"), nullable=True)
    case = relationship("InterviewCase", back_populates="questions")
    major_id = Column(Integer, ForeignKey("majors.id", ondelete="SET NULL"), nullable=True)
    major = sa_relationship("Major", foreign_keys=[major_id])

    # Quiz-specific fields
    is_quiz = Column(Boolean, default=False, nullable=False)
    is_open_ended = Column(Boolean, default=False, nullable=False)
    open_ended_sample = Column(Text, nullable=True)
    option_a = Column(Text, nullable=True)
    option_b = Column(Text, nullable=True)
    option_c = Column(Text, nullable=True)
    option_d = Column(Text, nullable=True)
    correct_option = Column(String(1), nullable=True)  # "a" | "b" | "c" | "d"
    explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())