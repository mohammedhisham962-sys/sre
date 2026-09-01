from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("/")
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).order_by(models.Incident.detected_at.desc()).all()
    result = []
    for inc in incidents:
        project_name = inc.project.name if inc.project else "Unknown"
        events = [{"message": e.message, "timestamp": e.timestamp.isoformat(), "evidence": e.evidence_json} for e in inc.events]
        result.append({
            "id": inc.id,
            "project_name": project_name,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "detected_at": inc.detected_at.isoformat(),
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
            "events": events
        })
    return result

@router.post("/", response_model=schemas.Incident)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    db_incident = models.Incident(**incident.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident
