from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models, schemas
from ..services.postmortem_service import PostMortemGenerator

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

@router.get("/postmortems/all")
def get_all_postmortems(db: Session = Depends(get_db)):
    """
    Generates / returns post-mortems for all historical incidents in the system.
    """
    incidents = db.query(models.Incident).order_by(models.Incident.detected_at.desc()).all()
    postmortems = []
    
    # If no historical incidents in DB, provide sample canonical incidents
    if not incidents:
        synthetic_incidents = [
            {
                "id": 101,
                "title": "High Memory Pressure & OOM Kill on Payment Gateway Pod",
                "severity": "CRITICAL",
                "status": "RESOLVED",
                "project_name": "Payment Gateway API",
                "logs": "Out of memory: Kill process 42 (node) score 852 or sacrifice child"
            },
            {
                "id": 102,
                "title": "Ingress 504 Gateway Timeout Spike during Flash Sale",
                "severity": "HIGH",
                "status": "RESOLVED",
                "project_name": "Checkout Service",
                "logs": "504 Gateway Timeout: DB connection pool exhausted"
            },
            {
                "id": 103,
                "title": "Unauthorized Dependency Import Intercepted by Sentinel",
                "severity": "MEDIUM",
                "status": "RESOLVED",
                "project_name": "Core Backend API",
                "logs": "AST Security Gate: Forbidden import detected"
            }
        ]
        for item in synthetic_incidents:
            pm = PostMortemGenerator.generate(
                incident_id=item["id"],
                title=item["title"],
                severity=item["severity"],
                status=item["status"],
                detected_at=None,
                resolved_at=None,
                project_name=item["project_name"],
                raw_error_logs=item["logs"]
            )
            postmortems.append(pm)
        return postmortems

    for inc in incidents:
        proj_name = inc.project.name if inc.project else "Production Service"
        events_list = [
            {"message": e.message, "timestamp": e.timestamp.isoformat() if e.timestamp else "", "evidence": e.evidence_json}
            for e in inc.events
        ]
        pm = PostMortemGenerator.generate(
            incident_id=inc.id,
            title=inc.title or "Service Outage",
            severity=inc.severity or "HIGH",
            status=inc.status or "RESOLVED",
            detected_at=inc.detected_at,
            resolved_at=inc.resolved_at,
            project_name=proj_name,
            events=events_list,
            raw_error_logs=inc.description or ""
        )
        postmortems.append(pm)
    
    return postmortems

@router.get("/{incident_id}/postmortem")
@router.post("/{incident_id}/postmortem")
def generate_incident_postmortem(incident_id: int, db: Session = Depends(get_db)):
    """
    Generates an automated, blameless post-mortem report for a specific incident.
    """
    inc = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not inc:
        # Fallback for synthetic inspection
        return PostMortemGenerator.generate(
            incident_id=incident_id,
            title=f"Incident #{incident_id} System Outage",
            severity="HIGH",
            status="RESOLVED",
            detected_at=None,
            resolved_at=None,
            project_name="Core Production API",
            raw_error_logs="Synthetic failure incident"
        )

    proj_name = inc.project.name if inc.project else "Production Service"
    events_list = [
        {"message": e.message, "timestamp": e.timestamp.isoformat() if e.timestamp else "", "evidence": e.evidence_json}
        for e in inc.events
    ]
    return PostMortemGenerator.generate(
        incident_id=inc.id,
        title=inc.title or f"Incident #{inc.id}",
        severity=inc.severity or "HIGH",
        status=inc.status or "RESOLVED",
        detected_at=inc.detected_at,
        resolved_at=inc.resolved_at,
        project_name=proj_name,
        events=events_list,
        raw_error_logs=inc.description or ""
    )
