from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.topology_service import TopologyService
from pydantic import BaseModel

router = APIRouter()

class FailoverRequest(BaseModel):
    drain_region: str = "us-east-1"
    target_region: Optional[str] = "eu-west-1"

@router.get("/regions")
def get_global_topology():
    """
    Returns real-time multi-region health, latency, connections, and replication lag.
    """
    return TopologyService.get_topology()

@router.post("/failover")
def trigger_regional_failover(
    req: Optional[FailoverRequest] = None,
    drain_region: str = Query("us-east-1"),
    target_region: str = Query("eu-west-1"),
    db: Session = Depends(get_db)
):
    """
    Executes DNS traffic steering failover from a degraded region to a target region.
    """
    dr_id = req.drain_region if req else drain_region
    tgt_id = req.target_region if (req and req.target_region) else target_region

    result = TopologyService.execute_failover(drain_region_id=dr_id, target_region_id=tgt_id)

    # Record to audit log
    audit_entry = models.AuditLog(
        action="REGIONAL_TRAFFIC_FAILOVER",
        user_id="sre-autonomous-agent",
        details=f"Drained region {result['drained_region']} and redirected {result['traffic_shifted_pct']}% traffic to {result['target_region']}"
    )
    db.add(audit_entry)
    db.commit()

    return result
