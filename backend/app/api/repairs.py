from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..services.workspace_manager import workspace_manager
from ..services.git_provider import git_provider
from ..logger import logger

router = APIRouter()

@router.post("/{incident_id}/clone")
def clone_repository_for_repair(incident_id: int, db: Session = Depends(get_db)):
    """
    Creates an isolated workspace and clones the repository for a specific incident.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    project = incident.project
    if not project or not project.repository_url:
        raise HTTPException(status_code=400, detail="Project does not have a repository URL configured")

    try:
        # 1. Create isolated workspace
        workspace_path = workspace_manager.create_workspace(project.id, incident_id)
        
        # 2. Clone repository securely
        git_provider.clone_repository(project.repository_url, workspace_path)
        
        # 3. Enforce protection rule: immediately switch to a repair branch
        branch_name = f"aigra-repair-inc-{incident_id}"
        git_provider.create_repair_branch(workspace_path, branch_name)
        
        # 4. Get status to prove it worked
        status = git_provider.get_status(workspace_path)
        
        return {
            "message": "Successfully created isolated workspace and cloned repository.",
            "workspace_path": workspace_path,
            "branch": branch_name,
            "git_status": status
        }
    except Exception as e:
        logger.error(f"Failed to clone repository: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
