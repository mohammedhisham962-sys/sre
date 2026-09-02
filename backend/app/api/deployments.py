from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models.project import Project
from ..services.github_client import github_client

router = APIRouter()

@router.get("/")
async def get_deployments_telemetry(db: Session = Depends(get_db)):
    """
    Returns real GitHub Actions CI/CD workflow runs and deployment history.
    """
    project = db.query(Project).filter(Project.repository_url.isnot(None)).first()
    
    if not project or not project.repository_url:
        return {
            "repository": None,
            "has_token": github_client.has_token(),
            "runs": []
        }

    runs = await github_client.get_workflow_runs(project.repository_url)
    
    formatted_runs = []
    for r in runs:
        formatted_runs.append({
            "id": r.get("id"),
            "name": r.get("name"),
            "event": r.get("event"),
            "status": r.get("status"), # "completed", "in_progress", "queued"
            "conclusion": r.get("conclusion"), # "success", "failure", "cancelled"
            "branch": r.get("head_branch"),
            "commit_sha": r.get("head_sha", "")[:7],
            "commit_message": r.get("head_commit", {}).get("message", "Triggered CI Run") if r.get("head_commit") else "CI Run",
            "author": r.get("head_commit", {}).get("author", {}).get("name", "AIGRA") if r.get("head_commit") else "AIGRA",
            "created_at": r.get("created_at"),
            "updated_at": r.get("updated_at"),
            "html_url": r.get("html_url")
        })

    return {
        "repository": project.repository_url,
        "has_token": github_client.has_token(),
        "runs": formatted_runs
    }
