from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from ..database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String, index=True) # e.g. "SECURITY_BLOCK", "AI_REPAIR_TRIGGERED", "PULL_REQUEST_CREATED", "MONITOR_STATUS_CHANGE", "POLICY_EVALUATED"
    actor = Column(String, default="SYSTEM") # "SYSTEM", "AI_AGENT", "USER"
    severity = Column(String, default="INFO") # "INFO", "WARNING", "CRITICAL", "SUCCESS"
    target = Column(String, nullable=True) # e.g. "Project Alpha", "repair/incident-1"
    summary = Column(String)
    details_json = Column(Text, nullable=True)
