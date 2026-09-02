from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.webhook import WebhookConfig
from ..services.webhook_dispatcher import webhook_dispatcher
from ..services.audit_service import audit_service

router = APIRouter()

class WebhookCreate(BaseModel):
    name: str
    url: str
    channel_type: Optional[str] = "SLACK" # SLACK, DISCORD, CUSTOM_HTTP
    trigger_incidents: Optional[bool] = True
    trigger_repairs: Optional[bool] = True
    trigger_security: Optional[bool] = True

class WebhookResponse(BaseModel):
    id: int
    name: str
    url: str
    channel_type: str
    trigger_incidents: bool
    trigger_repairs: bool
    trigger_security: bool
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[WebhookResponse])
def list_webhooks(db: Session = Depends(get_db)):
    """
    Returns all configured alerting webhooks.
    """
    return db.query(WebhookConfig).all()

@router.post("/", response_model=WebhookResponse)
def create_webhook(req: WebhookCreate, db: Session = Depends(get_db)):
    """
    Registers a new webhook endpoint for automated alerting.
    """
    item = WebhookConfig(**req.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    
    audit_service.log_event(
        event_type="WEBHOOK_CREATED",
        summary=f"Added alerting webhook '{item.name}' ({item.channel_type})",
        actor="ADMIN",
        severity="INFO",
        target=item.name,
        db=db
    )
    return item

@router.delete("/{webhook_id}")
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """
    Deletes a webhook configuration.
    """
    item = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Webhook not found")
        
    name = item.name
    db.delete(item)
    db.commit()

    audit_service.log_event(
        event_type="WEBHOOK_DELETED",
        summary=f"Deleted alerting webhook '{name}'",
        actor="ADMIN",
        severity="WARNING",
        target=name,
        db=db
    )
    return {"message": "Webhook deleted"}

@router.post("/{webhook_id}/test")
async def test_webhook(webhook_id: int, db: Session = Depends(get_db)):
    """
    Sends a sample test alert to verify the webhook connection.
    """
    item = db.query(WebhookConfig).filter(WebhookConfig.id == webhook_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Webhook not found")
        
    await webhook_dispatcher.dispatch_event(
        event_type="TEST_ALERT",
        title="Test Alert from AIGRA Ops",
        description=f"This is a test notification confirming that the webhook '{item.name}' is functioning properly.",
        severity="INFO",
        details={"channel_type": item.channel_type, "timestamp": datetime.utcnow().isoformat()}
    )
    return {"message": f"Test alert dispatched to '{item.name}'"}
