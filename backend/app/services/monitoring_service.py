import httpx
import asyncio
import logging
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.monitor import Monitor
from ..models.incident import Incident

logger = logging.getLogger(__name__)

async def check_website(monitor: Monitor, db: Session):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(monitor.url)
            if response.status_code >= 400:
                create_incident(monitor, db, f"HTTP Error {response.status_code}", "HIGH")
            else:
                logger.info(f"Monitor {monitor.name} is healthy (Status {response.status_code})")
    except Exception as e:
        create_incident(monitor, db, f"Connection Failed: {str(e)}", "CRITICAL")

def create_incident(monitor: Monitor, db: Session, description: str, severity: str):
    # Check if active incident already exists for this monitor
    existing = db.query(Incident).filter(
        Incident.project_id == monitor.project_id,
        Incident.status != "RESOLVED",
        Incident.title == f"Monitor Failure: {monitor.name}"
    ).first()

    if not existing:
        incident = Incident(
            project_id=monitor.project_id,
            title=f"Monitor Failure: {monitor.name}",
            description=description,
            severity=severity,
            status="DETECTED"
        )
        db.add(incident)
        db.commit()
        logger.error(f"Incident created: {incident.title}")

async def run_monitoring_cycle():
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).filter(Monitor.is_active == True).all()
        tasks = [check_website(m, db) for m in monitors]
        if tasks:
            await asyncio.gather(*tasks)
    finally:
        db.close()
