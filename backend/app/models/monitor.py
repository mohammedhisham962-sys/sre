from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    url = Column(String)
    monitor_type = Column(String, default="HTTP")  # HTTP, API, PING
    interval_seconds = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)

    project = relationship("Project", back_populates="monitors")
