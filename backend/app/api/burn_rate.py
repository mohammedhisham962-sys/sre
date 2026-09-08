from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.burn_rate_service import BurnRateService
from pydantic import BaseModel

router = APIRouter()

class FreezeToggleRequest(BaseModel):
    service_id: str = "svc-events"
    freeze: bool = True

@router.get("/status")
def get_error_budgets_status():
    """
    Returns multi-window burn rates (1h/6h/24h/3d), budget depletion forecasts, and service error budget reserves.
    """
    return BurnRateService.get_status()

@router.post("/freeze-toggle")
def toggle_deployment_freeze(
    req: Optional[FreezeToggleRequest] = None,
    service_id: str = Query("svc-events"),
    freeze: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Enforces or releases an automated CI/CD deployment freeze when error budget thresholds are breached.
    """
    target_svc = req.service_id if req else service_id
    is_freeze = req.freeze if req else freeze

    result = BurnRateService.toggle_freeze(service_id=target_svc, freeze=is_freeze)

    # Record to audit log
    audit_entry = models.AuditLog(
        action=f"ERROR_BUDGET_{result['action']}",
        user_id="sre-burn-rate-guard",
        details=f"Service '{result['service_name']}' deployment freeze set to: {result['deployment_frozen']}"
    )
    db.add(audit_entry)
    db.commit()

    return result
