from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional

from ..database import get_db
from ..services.canary_guard import canary_guard

router = APIRouter()

class CanaryEvalRequest(BaseModel):
    canary_version: str
    baseline_latency_ms: float = 24.5
    canary_latency_ms: float = 28.0
    baseline_error_rate: float = 0.001
    canary_error_rate: float = 0.002

@router.get("/status")
def get_canary_status():
    """
    Returns active canary deployments and traffic split percentages.
    """
    return {
        "active_canary": {
            "version": "v2.14.0-canary.3",
            "traffic_split": {"baseline": 90, "canary": 10},
            "status": "EVALUATING",
            "deployed_at": "2026-09-07T12:00:00Z",
            "guardrail_thresholds": {
                "max_latency_increase_pct": 15.0,
                "max_error_rate_pct": 5.0
            }
        }
    }

@router.post("/evaluate")
def evaluate_canary(req: CanaryEvalRequest, db: Session = Depends(get_db)):
    """
    Evaluates canary performance and triggers automated rollback if degraded.
    """
    result = canary_guard.evaluate_canary(
        canary_version=req.canary_version,
        baseline_latency_ms=req.baseline_latency_ms,
        canary_latency_ms=req.canary_latency_ms,
        baseline_error_rate=req.baseline_error_rate,
        canary_error_rate=req.canary_error_rate,
        db=db
    )
    return result
