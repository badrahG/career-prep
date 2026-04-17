from pydantic import BaseModel
from typing import Optional
from datetime import date


class ScholarshipResponse(BaseModel):
    id: int
    name: str
    organization: Optional[str] = None
    target: Optional[str] = None
    requirements: Optional[str] = None
    deadline: Optional[date] = None
    website_url: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True