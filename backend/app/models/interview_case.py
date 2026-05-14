from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class InterviewCase(Base):
    __tablename__ = "interview_cases"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    case_text = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=True, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship("InterviewQuestion", back_populates="case")
