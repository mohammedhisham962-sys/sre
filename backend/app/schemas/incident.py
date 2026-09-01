from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    title: str
    severity: Optional[str] = "MEDIUM"
    status: Optional[str] = "DETECTED"
    description: Optional[str] = None

class IncidentCreate(IncidentBase):
    project_id: int

class Incident(IncidentBase):
    id: int
    project_id: int
    detected_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
