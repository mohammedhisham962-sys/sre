from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from .. import models
from ..services.finops_service import FinOpsService
from pydantic import BaseModel

router = APIRouter()

class ApplyRecommendationRequest(BaseModel):
    recommendation_id: str = "REC-01"

@router.get("/summary")
def get_finops_summary():
    """
    Returns total monthly cloud spend, budget utilization, category breakdowns, and anomaly alerts.
    """
    return FinOpsService.get_summary()

@router.get("/recommendations")
def get_cost_recommendations():
    """
    Returns AI-generated right-sizing recommendations with projected monthly savings.
    """
    return FinOpsService.get_recommendations()

@router.post("/apply")
def apply_cost_recommendation(
    req: Optional[ApplyRecommendationRequest] = None,
    rec_id: str = Query("REC-01"),
    db: Session = Depends(get_db)
):
    """
    Applies an automated right-sizing action and records the cost reduction to the audit trail.
    """
    target_id = req.recommendation_id if req else rec_id
    result = FinOpsService.apply_recommendation(rec_id=target_id)

    # Record to audit log
    audit_entry = models.AuditLog(
        action="FINOPS_RIGHTSIZING_APPLIED",
        user_id="sre-finops-optimizer",
        details=f"Applied recommendation '{result['title']}' (${result['monthly_savings_unlocked_usd']}/mo savings unlocked)"
    )
    db.add(audit_entry)
    db.commit()

    return result
