from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, Boolean
from sqlalchemy.sql import func
import enum

from app.database import Base


class AdviceCategory(str, enum.Enum):
    cv = "cv"                    # CV бичих зөвлөмж
    interview = "interview"      # Ярилцлагын зөвлөмж
    job_search = "job_search"    # Ажил олох зөвлөмж
    career = "career"            # Ерөнхий карьерын зөвлөмж


class Advice(Base):
    __tablename__ = "advices"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(AdviceCategory), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)       # short description shown on cards
    content = Column(Text, nullable=False)      # full content (supports line breaks)
    youtube_url = Column(String(500), nullable=True)  # optional YouTube URL
    external_links = Column(Text, nullable=True)  # JSON string of [{title, url}]
    sort_order = Column(Integer, default=0, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())