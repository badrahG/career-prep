from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EducationCreate(BaseModel):
    school: str
    major: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    gpa: Optional[float] = None

class EducationResponse(EducationCreate):
    id: int
    class Config:
        from_attributes = True


class ExperienceCreate(BaseModel):
    company: str
    position: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class ExperienceResponse(ExperienceCreate):
    id: int
    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    skill_name: str
    skill_type: Optional[str] = None
    level: Optional[str] = None

class SkillResponse(SkillCreate):
    id: int
    class Config:
        from_attributes = True


class CVCreate(BaseModel):
    name: str
    template_type: Optional[str] = "modern"
    personal_info: Optional[str] = None
    educations: Optional[List[EducationCreate]] = []
    experiences: Optional[List[ExperienceCreate]] = []
    skills: Optional[List[SkillCreate]] = []


class CVResponse(BaseModel):
    id: int
    name: str
    template_type: str
    personal_info: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    educations: List[EducationResponse] = []
    experiences: List[ExperienceResponse] = []
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True


class CVListResponse(BaseModel):
    id: int
    name: str
    template_type: str
    created_at: datetime

    class Config:
        from_attributes = True