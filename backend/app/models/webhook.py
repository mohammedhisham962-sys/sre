from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from ..database import Base

class WebhookConfig(Base):
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    channel_type = Column(String, default="SLACK") # "SLACK", "DISCORD", "CUSTOM_HTTP"
    trigger_incidents = Column(Boolean, default=True)
    trigger_repairs = Column(Boolean, default=True)
    trigger_security = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
