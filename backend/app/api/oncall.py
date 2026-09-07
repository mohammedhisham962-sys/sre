from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional

from ..database import get_db
from ..services.oncall_service import oncall_service

router = APIRouter()

class TriggerPageRequest(BaseModel):
    incident_id: int
    title: str
    severity: Optional[str] = "CRITICAL"
    routing_key: Optional[str] = ""

@router.get("/schedule")
def get_oncall_schedule():
    """
    Returns current active on-call primary/secondary engineers and escalation policies.
    """
    return oncall_service.get_current_on_call()

@router.post("/trigger")
async def trigger_emergency_page(req: TriggerPageRequest, db: Session = Depends(get_db)):
    """
    Triggers an emergency PagerDuty/SMS page to the active on-call engineer.
    """
    result = await oncall_service.trigger_page(
        incident_id=req.incident_id,
        title=req.title,
        routing_key=req.routing_key,
        db=db
    )
    return result
