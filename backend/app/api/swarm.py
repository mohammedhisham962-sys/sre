from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.swarm_service import SwarmService
from pydantic import BaseModel

router = APIRouter()

class SwarmMissionRequest(BaseModel):
    mission_name: Optional[str] = "Full Infrastructure Security & Resilience Audit"

@router.get("/agents")
def get_swarm_agents():
    """
    Returns live autonomous SRE agent statuses, current thoughts, and token consumption.
    """
    return SwarmService.get_swarm_status()

@router.post("/mission")
def launch_swarm_mission(
    req: Optional[SwarmMissionRequest] = None,
    mission_name: str = Query("Full Infrastructure Security & Resilience Audit"),
    db: Session = Depends(get_db)
):
    """
    Launches an autonomous collaborative mission across all specialized SRE agents.
    """
    target_name = req.mission_name if (req and req.mission_name) else mission_name
    result = SwarmService.launch_mission(mission_name=target_name)

    # Record to audit log
    audit_entry = models.AuditLog(
        action="SWARM_MISSION_EXECUTED",
        user_id="sre-swarm-orchestrator",
        details=f"Launched multi-agent mission '{result['mission_name']}' ({result['mission_id']}) with status: {result['status']}"
    )
    db.add(audit_entry)
    db.commit()

    return result
