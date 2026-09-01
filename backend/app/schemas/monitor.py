from pydantic import BaseModel
from typing import Optional

class MonitorBase(BaseModel):
    name: str
    url: str
    monitor_type: Optional[str] = "HTTP"
    interval_seconds: Optional[int] = 60
    is_active: Optional[bool] = True

class MonitorCreate(MonitorBase):
    project_id: int

class Monitor(MonitorBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True
