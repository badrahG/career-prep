from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class TemplateType(str, enum.Enum):
    modern = "modern"
    classic = "classic"
    minimal = "minimal"


class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    template_type = Column(Enum(TemplateType), default=TemplateType.modern)
    personal_info = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    educations = relationship("Education", back_populates="cv", cascade="all, delete-orphan")
    experiences = relationship("WorkExperience", back_populates="cv", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="cv", cascade="all, delete-orphan")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)
    school = Column(String(200), nullable=False)
    major = Column(String(200), nullable=True)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    gpa = Column(Float, nullable=True)

    cv = relationship("CV", back_populates="educations")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)
    company = Column(String(200), nullable=False)
    position = Column(String(200), nullable=True)
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)

    cv = relationship("CV", back_populates="experiences")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    skill_type = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)

    cv = relationship("CV", back_populates="skills")