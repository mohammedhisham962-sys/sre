from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter()

@router.get("")
@router.get("/")
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).order_by(models.Incident.detected_at.desc()).all()
    result = []
    for inc in incidents:
        project_name = inc.project.name if inc.project else "Unknown"
        events = [{"message": e.message, "timestamp": e.timestamp.isoformat() if e.timestamp else "", "evidence": e.evidence_json} for e in inc.events]
        detected_str = inc.detected_at.isoformat() if inc.detected_at else ""
        resolved_str = inc.resolved_at.isoformat() if inc.resolved_at else None
        result.append({
            "id": inc.id,
            "project_name": project_name,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "detected_at": detected_str,
            "resolved_at": resolved_str,
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
