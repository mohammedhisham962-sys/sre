from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Runbook(Base):
    __tablename__ = "runbooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="GENERAL") # DATABASE, INGRESS, CACHE, SECURITY, K8S
    description = Column(Text, nullable=True)
    steps_json = Column(Text, nullable=False)
    is_automated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    executions = relationship("RunbookExecution", back_populates="runbook", cascade="all, delete-orphan")

class RunbookExecution(Base):
    __tablename__ = "runbook_executions"

    id = Column(Integer, primary_key=True, index=True)
    runbook_id = Column(Integer, ForeignKey("runbooks.id"), nullable=False)
    executed_by = Column(String, default="Autonomous Agent (Sentinel)")
    dry_run = Column(Boolean, default=False)
    status = Column(String, default="SUCCESS") # SUCCESS, FAILED, RUNNING
    logs_json = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)

    runbook = relationship("Runbook", back_populates="executions")
