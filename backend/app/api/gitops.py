from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.gitops_service import GitOpsService

router = APIRouter(prefix="/api/v1/gitops", tags=["GitOps & Progressive Delivery"])

class GitOpsSyncRequest(BaseModel):
    app_name: str
    prune: Optional[bool] = True
    dry_run: Optional[bool] = False

@router.get("/apps")
def get_gitops_applications() -> Dict[str, Any]:
    """Returns list of GitOps applications, health condition, and cluster drift diffs."""
    return GitOpsService.get_applications()

@router.post("/sync")
def sync_gitops_application(payload: GitOpsSyncRequest) -> Dict[str, Any]:
    """Triggers progressive GitOps reconciliation sync wave for the application."""
    if not payload.app_name:
        raise HTTPException(status_code=400, detail="app_name is required")
    return GitOpsService.sync_application(
        app_name=payload.app_name,
        prune=payload.prune if payload.prune is not None else True,
        dry_run=payload.dry_run if payload.dry_run is not None else False
    )
