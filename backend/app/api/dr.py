from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from ..services.dr_service import DisasterRecoveryService

router = APIRouter()

@router.get("/status")
def get_dr_status():
    """
    Returns disaster recovery compliance scorecards, RTO/RPO objectives, and verified backup snapshots.
    """
    return DisasterRecoveryService.get_status()

@router.post("/drill")
def trigger_dr_drill(db: Session = Depends(get_db)):
    """
    Executes an automated non-destructive Point-In-Time recovery drill and logs results.
    """
    result = DisasterRecoveryService.execute_drill()

    # Record to audit log
    audit_entry = models.AuditLog(
        action="DISASTER_RECOVERY_DRILL_EXECUTED",
        user_id="sre-dr-orchestrator",
        details=f"Executed automated DR drill {result['drill_id']} with status: {result['status']} (Restoration time: {result['total_duration_sec']}s)"
    )
    db.add(audit_entry)
    db.commit()

    return result
