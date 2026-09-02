from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
import json

from ..database import get_db
from ..models.project import Project
from ..models.monitor import Monitor
from ..models.incident import Incident, IncidentEvent
from ..models.policy import Policy
from ..models.audit import AuditLog
from ..models.approval import ApprovalRequest
from ..models.webhook import WebhookConfig
from ..services.audit_service import audit_service

router = APIRouter()

class RestorePayload(BaseModel):
    snapshot: Dict[str, Any]

@router.get("/export")
def export_database_snapshot(db: Session = Depends(get_db)):
    """
    Exports a complete disaster recovery JSON snapshot of all database entities.
    """
    projects = db.query(Project).all()
    monitors = db.query(Monitor).all()
    incidents = db.query(Incident).all()
    policies = db.query(Policy).all()
    audit_logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(100).all()
    approvals = db.query(ApprovalRequest).all()
    webhooks = db.query(WebhookConfig).all()

    snapshot_data = {
        "metadata": {
            "platform": "AIGRA_OPS",
            "version": "1.0.0",
            "exported_at": datetime.utcnow().isoformat(),
            "entity_counts": {
                "projects": len(projects),
                "monitors": len(monitors),
                "incidents": len(incidents),
                "policies": len(policies),
                "audit_logs": len(audit_logs),
                "approvals": len(approvals),
                "webhooks": len(webhooks)
            }
        },
        "projects": [{"id": p.id, "name": p.name, "repository_url": p.repository_url, "description": p.description} for p in projects],
        "monitors": [{"id": m.id, "project_id": m.project_id, "name": m.name, "url": m.url, "interval_seconds": m.interval_seconds, "is_active": m.is_active} for m in monitors],
        "incidents": [{"id": i.id, "project_id": i.project_id, "title": i.title, "severity": i.severity, "status": i.status, "description": i.description} for i in incidents],
        "policies": [{"id": pol.id, "name": pol.name, "trigger_event": pol.trigger_event, "action_type": pol.action_type, "approval_level": pol.approval_level, "is_active": pol.is_active} for pol in policies],
        "audit_logs": [{"id": a.id, "event_type": a.event_type, "actor": a.actor, "severity": a.severity, "summary": a.summary, "timestamp": a.timestamp.isoformat() if a.timestamp else None} for a in audit_logs],
        "approvals": [{"id": ap.id, "title": ap.title, "status": ap.status, "action_type": ap.action_type} for ap in approvals],
        "webhooks": [{"id": w.id, "name": w.name, "url": w.url, "channel_type": w.channel_type, "is_active": w.is_active} for w in webhooks]
    }

    audit_service.log_event(
        event_type="DISASTER_RECOVERY_SNAPSHOT_EXPORTED",
        summary="Exported complete platform database snapshot",
        actor="ADMIN",
        severity="INFO",
        target="SYSTEM_DATABASE",
        db=db
    )

    formatted_json = json.dumps(snapshot_data, indent=2)
    return Response(
        content=formatted_json,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=aigra_ops_snapshot_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"}
    )
