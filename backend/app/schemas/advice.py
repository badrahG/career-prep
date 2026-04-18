from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AdviceCreate(BaseModel):
    category: str
    title: str
    summary: Optional[str] = None
    content: str
    youtube_url: Optional[str] = None
    external_links: Optional[str] = None  # JSON string
    sort_order: Optional[int] = 0
    is_published: Optional[bool] = True


class AdviceResponse(BaseModel):
    id: int
    category: str
    title: str
    summary: Optional[str] = None
    content: str
    youtube_url: Optional[str] = None
    external_links: Optional[str] = None
    sort_order: int
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdviceStats(BaseModel):
    cv: int
    interview: int
    job_search: int
    career: int
    total: int