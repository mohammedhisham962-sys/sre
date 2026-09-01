from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.ProjectWithStatus])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    result = []
    for p in projects:
        # Get latest monitoring result if exists
        status = "Unknown"
        latency = None
        if p.monitors:
            monitor = p.monitors[0] # Just grab the first one for MVP
            latest_result = db.query(models.monitor.MonitoringResult).filter(
                models.monitor.MonitoringResult.monitor_id == monitor.id
            ).order_by(models.monitor.MonitoringResult.id.desc()).first()
            
            if latest_result:
                if latest_result.is_up:
                    status = "Healthy"
                    latency = latest_result.latency_ms
                else:
                    status = "Failing"
                    
        result.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "environment": p.environment,
            "repository_url": p.repository_url,
            "status": status,
            "latency": latency
        })
    return result

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project
