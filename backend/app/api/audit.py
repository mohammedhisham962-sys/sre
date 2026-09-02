from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from ..database import get_db
from ..models.audit import AuditLog

router = APIRouter()

@router.get("")
@router.get("/")
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns filterable audit logs sorted by most recent first.
    """
    query = db.query(AuditLog)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if severity:
        query = query.filter(AuditLog.severity == severity)
        
    logs = query.order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()
    
    result = []
    for log in logs:
        parsed_details = None
        if log.details_json:
            try:
                parsed_details = json.loads(log.details_json)
            except Exception:
                parsed_details = {"raw": log.details_json}
                
        result.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "event_type": log.event_type,
            "actor": log.actor,
            "severity": log.severity,
            "target": log.target,
            "summary": log.summary,
            "details": parsed_details
        })
    return result
