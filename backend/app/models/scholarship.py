from sqlalchemy import Column, Integer, String, Text, Date

from app.database import Base


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    organization = Column(String(300), nullable=True)
    target = Column(String(100), nullable=True)
    requirements = Column(Text, nullable=True)
    deadline = Column(Date, nullable=True)
    website_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    gpa = Column(String(50), nullable=True)
    duration = Column(String(200), nullable=True)