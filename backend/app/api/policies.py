from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json

from ..database import get_db
from ..models.policy import Policy
from ..services.audit_service import audit_service

router = APIRouter()

class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_event: str
    action_type: str
    approval_level: str
    conditions_json: Optional[str] = None
    is_active: Optional[bool] = True

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_event: Optional[str] = None
    action_type: Optional[str] = None
    approval_level: Optional[str] = None
    conditions_json: Optional[str] = None
    is_active: Optional[bool] = None

class PolicyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    trigger_event: str
    action_type: str
    approval_level: str
    conditions_json: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PolicyResponse])
def list_policies(db: Session = Depends(get_db)):
    """
    Returns all policies. Auto-seeds default SRE guardrails if none exist.
    """
    policies = db.query(Policy).all()
    if not policies:
        default_policies = [
            Policy(
                name="Autonomous AI Self-Healing",
                description="Automatically triggers sandboxed AI repair when double confirmation confirms downtime.",
                trigger_event="5XX_DOWNTIME",
                action_type="AUTO_TRIGGER_AI_REPAIR",
                approval_level="AUTOMATIC",
                conditions_json=json.dumps({"min_consecutive_failures": 2}),
                is_active=True
            ),
            Policy(
                name="Defensive Pre-Commit Guardrail",
                description="Strictly blocks git commits and PR creation if secrets or API keys are detected.",
                trigger_event="SECURITY_ALERT",
                action_type="BLOCK_COMMIT",
                approval_level="STRICT_BLOCK",
                conditions_json=json.dumps({"rules": ["AWS_ACCESS_KEY", "GENERIC_SECRET_ASSIGNMENT", "PRIVATE_KEY"]}),
                is_active=True
            ),
            Policy(
                name="Production Human-in-the-Loop",
                description="Mandates human review on GitHub before any automated PR can be merged to main.",
                trigger_event="PR_OPENED",
                action_type="REQUIRE_HUMAN_APPROVAL",
                approval_level="HUMAN_IN_THE_LOOP",
                conditions_json=json.dumps({"target_branch": "main"}),
                is_active=True
            )
        ]
        db.add_all(default_policies)
        db.commit()
        policies = db.query(Policy).all()
    return policies

@router.post("/", response_model=PolicyResponse)
def create_policy(policy_in: PolicyCreate, db: Session = Depends(get_db)):
    """
    Creates a new operational policy rule.
    """
    policy = Policy(**policy_in.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    
    audit_service.log_event(
        event_type="POLICY_CREATED",
        summary=f"Created new SRE policy: '{policy.name}' ({policy.action_type})",
        actor="USER",
        severity="INFO",
        target=policy.name,
        db=db
    )
    return policy

@router.put("/{policy_id}/toggle", response_model=PolicyResponse)
def toggle_policy(policy_id: int, db: Session = Depends(get_db)):
    """
    Toggles the active state of a policy.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    policy.is_active = not policy.is_active
    db.commit()
    db.refresh(policy)
    
    audit_service.log_event(
        event_type="POLICY_TOGGLED",
        summary=f"Policy '{policy.name}' is now {'ACTIVE' if policy.is_active else 'DISABLED'}",
        actor="USER",
        severity="WARNING" if not policy.is_active else "INFO",
        target=policy.name,
        db=db
    )
    return policy

@router.delete("/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    """
    Deletes an existing policy.
    """
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    name = policy.name
    db.delete(policy)
    db.commit()
    
    audit_service.log_event(
        event_type="POLICY_DELETED",
        summary=f"Deleted SRE policy: '{name}'",
        actor="USER",
        severity="WARNING",
        target=name,
        db=db
    )
    return {"message": "Policy deleted successfully"}
