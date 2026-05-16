from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class UserScholarshipChecklist(Base):
    __tablename__ = "user_scholarship_checklists"
    __table_args__ = (UniqueConstraint("user_id", "scholarship_id", name="uq_user_scholarship"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False)
    items = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
