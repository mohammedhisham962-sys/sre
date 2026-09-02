from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json

from ..database import get_db
from ..models.audit import AuditLog
from ..services.security_scanner import security_scanner
from ..services.audit_service import audit_service

router = APIRouter()

class ScanRequest(BaseModel):
    content: str
    target_name: Optional[str] = "Manual Scan Console"

class ScanFinding(BaseModel):
    rule: str
    severity: str
    description: str
    match_snippet: str

class ScanResponse(BaseModel):
    is_clean: bool
    findings_count: int
    findings: List[ScanFinding]

@router.post("/scan", response_model=ScanResponse)
def scan_code_or_patch(request: ScanRequest, db: Session = Depends(get_db)):
    """
    Scans arbitrary code, diffs, or secrets on demand.
    """
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content to scan cannot be empty")

    findings = security_scanner.inspect_content(request.content)
    is_clean = len(findings) == 0

    if not is_clean:
        audit_service.log_event(
            event_type="MANUAL_SECURITY_INTERCEPT",
            summary=f"Manual scan detected {len(findings)} secret(s) in '{request.target_name}'",
            actor="USER",
            severity="WARNING",
            target=request.target_name,
            details={"findings": findings},
            db=db
        )
    else:
        audit_service.log_event(
            event_type="MANUAL_SECURITY_PASSED",
            summary=f"Manual scan completed clean for '{request.target_name}'",
            actor="USER",
            severity="INFO",
            target=request.target_name,
            db=db
        )

    return {
        "is_clean": is_clean,
        "findings_count": len(findings),
        "findings": findings
    }

@router.get("/rules")
def get_security_rules():
    """
    Returns all active regex scanner rules and definitions.
    """
    rules_list = []
    for rule_name, rule_data in security_scanner.rules.items():
        rules_list.append({
            "name": rule_name,
            "pattern": rule_data["pattern"],
            "severity": rule_data["severity"],
            "description": rule_data["description"]
        })
    return rules_list

@router.get("/events")
def get_security_events(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns the recent security events and blocks.
    """
    events = db.query(AuditLog).filter(
        AuditLog.event_type.in_([
            "SECURITY_BLOCK", 
            "SECURITY_SCAN_PASSED", 
            "MANUAL_SECURITY_INTERCEPT", 
            "MANUAL_SECURITY_PASSED"
        ])
    ).order_by(AuditLog.id.desc()).limit(limit).all()

    result = []
    for e in events:
        details = None
        if e.details_json:
            try:
                details = json.loads(e.details_json)
            except Exception:
                pass
        result.append({
            "id": e.id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "event_type": e.event_type,
            "severity": e.severity,
            "target": e.target,
            "summary": e.summary,
            "details": details
        })
    return result
