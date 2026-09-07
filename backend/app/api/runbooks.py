from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models
from ..services.runbook_runner import RunbookRunner
from pydantic import BaseModel

router = APIRouter()

class RunbookExecuteRequest(BaseModel):
    dry_run: bool = False
    operator: Optional[str] = "Autonomous Sentinel SRE"

@router.get("")
@router.get("/")
def list_runbooks():
    """
    Returns all configured automated remediation runbooks.
    """
    return RunbookRunner.get_all_runbooks()

@router.post("/{runbook_id}/execute")
def execute_runbook(
    runbook_id: int,
    req: Optional[RunbookExecuteRequest] = None,
    dry_run: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Executes an SRE remediation runbook in either Dry-Run or Live Execution mode.
    """
    is_dry = dry_run
    operator = "Autonomous Sentinel SRE"
    if req:
        is_dry = req.dry_run or dry_run
        operator = req.operator or operator

    result = RunbookRunner.execute(runbook_id=runbook_id, dry_run=is_dry, operator=operator)
    
    # Record to audit log
    audit_entry = models.AuditLog(
        action=f"RUNBOOK_EXECUTION_{'DRYRUN' if is_dry else 'LIVE'}",
        user_id="sre-autonomous-agent",
        details=f"Executed runbook '{result['name']}' ({result['category']}) with status: {result['status']}"
    )
    db.add(audit_entry)
    db.commit()

    return result

@router.get("/history")
def get_runbook_history(db: Session = Depends(get_db)):
    """
    Returns historical runbook executions recorded in the audit log.
    """
    logs = db.query(models.AuditLog).filter(
        models.AuditLog.action.like("RUNBOOK_EXECUTION%")
    ).order_by(models.AuditLog.timestamp.desc()).limit(50).all()

    return [
        {
            "id": l.id,
            "action": l.action,
            "operator": l.user_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else ""
        }
        for l in logs
    ]
