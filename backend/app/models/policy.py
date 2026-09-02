from sqlalchemy import Column, Integer, String, Boolean, Text
from ..database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    trigger_event = Column(String, default="5XX_DOWNTIME") # "5XX_DOWNTIME", "HIGH_LATENCY", "SECURITY_ALERT", "PR_OPENED"
    action_type = Column(String, default="AUTO_TRIGGER_AI_REPAIR") # "AUTO_TRIGGER_AI_REPAIR", "REQUIRE_HUMAN_APPROVAL", "BLOCK_COMMIT"
    approval_level = Column(String, default="AUTOMATIC") # "AUTOMATIC", "HUMAN_IN_THE_LOOP", "STRICT_BLOCK"
    conditions_json = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
