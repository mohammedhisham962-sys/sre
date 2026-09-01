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

@router.post("/{incident_id}/execute")
async def execute_ai_repair(incident_id: int, db: Session = Depends(get_db)):
    """
    Executes the full AI Repair pipeline: Clone -> Groq Patch -> Apply -> Commit.
    """
    from ..services.ai_repair import ai_repair_engine
    try:
        result = await ai_repair_engine.execute_repair_pipeline(incident_id, db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pull-requests")
async def get_pull_requests(db: Session = Depends(get_db)):
    """
    Fetches live Pull Requests from GitHub for the active projects.
    """
    from ..services.github_client import github_client
    
    # Get the first project with a repository URL
    project = db.query(models.Project).filter(models.Project.repository_url.isnot(None)).first()
    if not project:
        return {"prs": [], "repo": None}
        
    prs = await github_client.get_pull_requests(project.repository_url)
    return {"prs": prs, "repo": project.repository_url}
