from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

from ..database import get_db
from ..models.approval import ApprovalRequest
from ..services.audit_service import audit_service

router = APIRouter()

class ApprovalCreate(BaseModel):
    title: str
    description: str
    action_type: str
    target_environment: Optional[str] = "production"
    requested_by: Optional[str] = "AI_ORCHESTRATOR"
    metadata_json: Optional[str] = None

class ApprovalReview(BaseModel):
    reviewer_name: Optional[str] = "Human Operator"
    notes: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: int
    title: str
    description: str
    action_type: str
    target_environment: str
    requested_by: str
    status: str
    created_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    reviewer_name: Optional[str]
    reviewer_notes: Optional[str]
    metadata_json: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ApprovalResponse])
def list_approvals(db: Session = Depends(get_db)):
    """
    Returns all human-in-the-loop approval requests. Auto-seeds sample queue items if empty.
    """
    approvals = db.query(ApprovalRequest).order_by(ApprovalRequest.id.desc()).all()
    if not approvals:
        sample_approvals = [
            ApprovalRequest(
                title="AI Auto-Repair Production Merge Authorization",
                description="AI Orchestrator has prepared patch 'aigra-repair-inc-1' to fix high-latency connection exhaustion.",
                action_type="PROD_MERGE",
                target_environment="production",
                requested_by="AI_ORCHESTRATOR",
                status="PENDING",
                metadata_json=json.dumps({
                    "branch": "aigra-repair-inc-1",
                    "files_changed": ["backend/app/database.py"],
                    "security_scan": "PASSED_CLEAN"
                })
            ),
            ApprovalRequest(
                title="Elevated Rate Limit Override for Gateway",
                description="SRE team requested automated rate limit threshold increase during scheduled flash traffic event.",
                action_type="CONFIG_OVERRIDE",
                target_environment="production",
                requested_by="SRE_OPERATOR",
                status="PENDING",
                metadata_json=json.dumps({
                    "target_service": "api-gateway",
                    "proposed_limit": "5000 req/sec"
                })
            )
        ]
        db.add_all(sample_approvals)
        db.commit()
        approvals = db.query(ApprovalRequest).order_by(ApprovalRequest.id.desc()).all()
    return approvals

@router.post("/", response_model=ApprovalResponse)
def create_approval(request: ApprovalCreate, db: Session = Depends(get_db)):
    """
    Submits a new action into the Human-in-the-Loop review queue.
    """
    item = ApprovalRequest(**request.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    
    audit_service.log_event(
        event_type="APPROVAL_REQUESTED",
        summary=f"New sign-off requested: '{item.title}' ({item.action_type})",
        actor=item.requested_by,
        severity="WARNING",
        target=item.target_environment,
        db=db
    )
    return item

@router.post("/{approval_id}/approve", response_model=ApprovalResponse)
def approve_request(approval_id: int, review: ApprovalReview, db: Session = Depends(get_db)):
    """
    Approves a pending operational change.
    """
    item = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval request not found")
        
    item.status = "APPROVED"
    item.reviewed_at = datetime.utcnow()
    item.reviewer_name = review.reviewer_name or "Human Operator"
    item.reviewer_notes = review.notes or "Authorized for production execution."
    db.commit()
    db.refresh(item)
    
    audit_service.log_event(
        event_type="APPROVAL_GRANTED",
        summary=f"Approved sign-off #{item.id}: '{item.title}' by {item.reviewer_name}",
        actor=item.reviewer_name,
        severity="SUCCESS",
        target=item.target_environment,
        details={"notes": item.reviewer_notes},
        db=db
    )
    return item

@router.post("/{approval_id}/reject", response_model=ApprovalResponse)
def reject_request(approval_id: int, review: ApprovalReview, db: Session = Depends(get_db)):
    """
    Rejects a pending operational change.
    """
    item = db.query(ApprovalRequest).filter(ApprovalRequest.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval request not found")
        
    item.status = "REJECTED"
    item.reviewed_at = datetime.utcnow()
    item.reviewer_name = review.reviewer_name or "Human Operator"
    item.reviewer_notes = review.notes or "Rejected by operator."
    db.commit()
    db.refresh(item)
    
    audit_service.log_event(
        event_type="APPROVAL_REJECTED",
        summary=f"Rejected sign-off #{item.id}: '{item.title}' by {item.reviewer_name}",
        actor=item.reviewer_name,
        severity="CRITICAL",
        target=item.target_environment,
        details={"notes": item.reviewer_notes},
        db=db
    )
    return item
