from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base


class UserQuizResult(Base):
    __tablename__ = "user_quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total = Column(Integer, nullable=False)
    correct = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserFlashcardProgress(Base):
    __tablename__ = "user_flashcard_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())


class UserStarSession(Base):
    __tablename__ = "user_star_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    major_id = Column(Integer, ForeignKey("majors.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
