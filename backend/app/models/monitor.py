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
    results = relationship("MonitoringResult", back_populates="monitor", cascade="all, delete-orphan")

class MonitoringResult(Base):
    __tablename__ = "monitoring_results"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"))
    timestamp = Column(String) # ISO format string for SQLite compatibility
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    is_up = Column(Boolean, default=False)
    error_message = Column(String, nullable=True)

    monitor = relationship("Monitor", back_populates="results")
