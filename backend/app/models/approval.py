from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from ..database import Base

class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    action_type = Column(String) # e.g. "PROD_MERGE", "SECURITY_OVERRIDE", "AUTO_REPAIR_APPLY"
    target_environment = Column(String, default="production")
    requested_by = Column(String, default="AI_ORCHESTRATOR")
    status = Column(String, default="PENDING") # "PENDING", "APPROVED", "REJECTED"
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewer_name = Column(String, nullable=True)
    reviewer_notes = Column(String, nullable=True)
    metadata_json = Column(Text, nullable=True)
