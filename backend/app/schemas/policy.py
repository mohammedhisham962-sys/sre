from pydantic import BaseModel
from typing import Optional, Dict, Any

class PolicyBase(BaseModel):
    name: str
    action_type: str
    approval_level: str
    conditions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = True

class PolicyCreate(PolicyBase):
    pass

class Policy(PolicyBase):
    id: int

    class Config:
        from_attributes = True
