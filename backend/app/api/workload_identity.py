from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.workload_identity_service import WorkloadIdentityService

router = APIRouter(prefix="/api/v1/workload-identity", tags=["Workload Identity & Secrets"])

class SecretRotateRequest(BaseModel):
    secret_id: str

@router.get("/status")
def get_workload_identity_status() -> Dict[str, Any]:
    """Returns status of multi-cloud workload identities and managed secrets."""
    return WorkloadIdentityService.get_identity_status()

@router.post("/rotate-secret")
def rotate_managed_secret(payload: SecretRotateRequest) -> Dict[str, Any]:
    """Triggers secret rotation and downstream zero-downtime rollover."""
    if not payload.secret_id:
        raise HTTPException(status_code=400, detail="secret_id is required")
    return WorkloadIdentityService.rotate_secret(payload.secret_id)
