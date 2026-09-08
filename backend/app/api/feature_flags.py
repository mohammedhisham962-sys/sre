from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.feature_flags_service import FeatureFlagsService

router = APIRouter(prefix="/api/v1/feature-flags", tags=["Feature Flags & Ring Deployments"])

class ToggleFlagRequest(BaseModel):
    flag_key: str
    enabled: bool
    ring: Optional[str] = None
    rollout_pct: Optional[int] = None

class KillSwitchRequest(BaseModel):
    flag_key: str
    reason: Optional[str] = "Manual SRE Incident Intervention"

@router.get("/flags")
def get_all_feature_flags() -> Dict[str, Any]:
    """Returns dynamic feature flags, progressive ring rollout status, and kill-switch state."""
    return FeatureFlagsService.get_flags()

@router.post("/toggle")
def toggle_feature_flag(payload: ToggleFlagRequest) -> Dict[str, Any]:
    """Updates flag activation state and ring rollout percentage."""
    if not payload.flag_key:
        raise HTTPException(status_code=400, detail="flag_key is required")
    return FeatureFlagsService.toggle_flag(
        flag_key=payload.flag_key,
        enabled=payload.enabled,
        ring=payload.ring,
        rollout_pct=payload.rollout_pct
    )

@router.post("/kill-switch")
def emergency_kill_switch(payload: KillSwitchRequest) -> Dict[str, Any]:
    """Trips emergency kill-switch instantly deactivating the flag across all global rings."""
    if not payload.flag_key:
        raise HTTPException(status_code=400, detail="flag_key is required")
    return FeatureFlagsService.trigger_kill_switch(
        flag_key=payload.flag_key,
        reason=payload.reason or "Manual SRE Incident Intervention"
    )
