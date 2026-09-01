from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=True)
    severity = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="DETECTED") # DETECTED, ANALYZING, RESOLVED
    title = Column(String)
    description = Column(Text, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="incidents")
    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")

class IncidentEvent(Base):
    __tablename__ = "incident_events"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    message = Column(String)
    evidence_json = Column(Text, nullable=True)
    
    incident = relationship("Incident", back_populates="events")
