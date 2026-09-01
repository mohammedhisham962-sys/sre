from sqlalchemy import Column, Integer, String, Boolean, JSON
from ..database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    action_type = Column(String) # e.g., "RESTART_SERVICE", "DEPLOY_CODE"
    approval_level = Column(String) # AUTOMATIC, APPROVAL_REQUIRED, MANUAL_ONLY
    conditions = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
