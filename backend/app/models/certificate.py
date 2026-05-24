from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    issued_date = Column(Date, nullable=True)
    cloudinary_url = Column(String(500), nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)
    external_id = Column(Integer, nullable=True)
    source = Column(String(100), default="volunteerchain")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
