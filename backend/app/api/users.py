from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..services.auth_service import AuthService
from ..services.audit_service import audit_service

router = APIRouter()

class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    role: str = "ENGINEER" # ADMIN, SRE_LEAD, ENGINEER, SECURITY_AUDITOR, VIEWER
    password: Optional[str] = "aigraOps2026!"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[UserResponse])
def list_team_members(db: Session = Depends(get_db)):
    """
    Returns the SRE team directory with assigned RBAC roles.
    Auto-seeds default SRE engineering team if table is empty.
    """
    users = db.query(User).order_by(User.id.asc()).all()
    if not users:
        default_team = [
            User(
                name="Principal Architect (Admin)",
                email="admin@aigra.ops",
                password_hash=AuthService.get_password_hash("adminPass123!"),
                role="ADMIN",
                is_active=True
            ),
            User(
                name="Lead SRE Engineer",
                email="sre.lead@aigra.ops",
                password_hash=AuthService.get_password_hash("srePass123!"),
                role="SRE_LEAD",
                is_active=True
            ),
            User(
                name="Defensive Security Analyst",
                email="security@aigra.ops",
                password_hash=AuthService.get_password_hash("secPass123!"),
                role="SECURITY_AUDITOR",
                is_active=True
            ),
            User(
                name="DevOps Platform Engineer",
                email="devops@aigra.ops",
                password_hash=AuthService.get_password_hash("devopsPass123!"),
                role="ENGINEER",
                is_active=True
            )
        ]
        db.add_all(default_team)
        db.commit()
        users = db.query(User).all()
    return users

@router.post("/", response_model=UserResponse)
def create_team_member(req: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Adds a new member to the engineering team.
    """
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=AuthService.get_password_hash(req.password or "aigraOps2026!"),
        role=req.role.upper(),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    audit_service.log_event(
        event_type="USER_CREATED",
        summary=f"Added new team member '{new_user.name}' with role {new_user.role}",
        actor="ADMIN",
        severity="INFO",
        target=new_user.email,
        db=db
    )
    return new_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(user_id: int, db: Session = Depends(get_db)):
    """
    Deletes a team member from the directory.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    email = user.email
    db.delete(user)
    db.commit()

    audit_service.log_event(
        event_type="USER_DELETED",
        summary=f"Removed team member: '{email}'",
        actor="ADMIN",
        severity="WARNING",
        target=email,
        db=db
    )
    return None
