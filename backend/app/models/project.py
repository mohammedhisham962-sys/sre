from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    environment = Column(String, default="production")
    repository_url = Column(String, nullable=True)

    monitors = relationship("Monitor", back_populates="project")
    incidents = relationship("Incident", back_populates="project")
