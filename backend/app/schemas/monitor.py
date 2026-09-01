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

class MonitoringResultBase(BaseModel):
    monitor_id: int
    timestamp: str
    status_code: Optional[int] = None
    latency_ms: Optional[int] = None
    is_up: bool = False
    error_message: Optional[str] = None

class MonitoringResult(MonitoringResultBase):
    id: int

    class Config:
        from_attributes = True
