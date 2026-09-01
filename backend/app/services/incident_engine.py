import httpx
import json
from sqlalchemy.orm import Session
from datetime import datetime
from ..models.monitor import Monitor, MonitoringResult
from ..models.incident import Incident, IncidentEvent
from ..logger import logger

class IncidentEngine:
    async def confirm_failure(self, monitor_id: int, url: str) -> dict:
        """
        FALSE POSITIVE PROTECTION:
        Instantly retry the check to ensure it wasn't a transient network blip.
        """
        logger.info(f"Validating potential failure for monitor {monitor_id} at {url}")
        async with httpx.AsyncClient() as client:
            try:
                # Tight timeout for confirmation
                response = await client.get(url, timeout=5.0)
                return {
                    "is_up": response.status_code < 400,
                    "status_code": response.status_code,
                    "error": None
                }
            except Exception as e:
                return {
                    "is_up": False,
                    "status_code": None,
                    "error": str(e)
                }

    async def handle_monitoring_result(self, db: Session, result: MonitoringResult):
        """
        Called by the background worker when a ping finishes.
        """
        monitor = db.query(Monitor).filter(Monitor.id == result.monitor_id).first()
        if not monitor:
            return
            
        # Is there already an active incident for this monitor?
        active_incident = db.query(Incident).filter(
            Incident.monitor_id == monitor.id,
            Incident.status != "RESOLVED"
        ).first()

        if result.is_up:
            # If healthy, resolve any active incident automatically
            if active_incident:
                active_incident.status = "RESOLVED"
                active_incident.resolved_at = datetime.utcnow()
                db.add(IncidentEvent(
                    incident_id=active_incident.id,
                    message="Service recovered and is responding healthily.",
                    evidence_json=json.dumps({"latency_ms": result.latency_ms, "status": result.status_code})
                ))
                db.commit()
                logger.info(f"Resolved incident {active_incident.id} for monitor {monitor.id}")
            return
            
        # If the ping FAILED, we trigger False Positive Protection
        logger.warning(f"Initial failure detected for monitor {monitor.id}. Confirming...")
        confirmation = await self.confirm_failure(monitor.id, monitor.url)
        
        if confirmation["is_up"]:
            logger.info(f"False positive avoided for monitor {monitor.id}. Service is actually up.")
            return
            
        # It genuinely failed both times.
        if active_incident:
            # Just log an event to the existing incident
            # Throttle events to avoid flooding the DB, but for MVP we just log it
            db.add(IncidentEvent(
                incident_id=active_incident.id,
                message="Ongoing failure confirmed.",
                evidence_json=json.dumps({"status_code": confirmation["status_code"], "error": confirmation["error"]})
            ))
            db.commit()
        else:
            # Create a brand new incident
            new_incident = Incident(
                project_id=monitor.project_id,
                monitor_id=monitor.id,
                severity="HIGH",
                status="DETECTED",
                title=f"Monitoring Failure: {monitor.name}",
                description=f"Automated monitoring detected a confirmed failure for {monitor.url}."
            )
            db.add(new_incident)
            db.commit()
            db.refresh(new_incident)
            
            # Log the evidence
            evidence = IncidentEvent(
                incident_id=new_incident.id,
                message="Incident created after initial failure and subsequent confirmation failure.",
                evidence_json=json.dumps({
                    "initial_error": result.error_message,
                    "initial_status": result.status_code,
                    "confirmation_error": confirmation["error"],
                    "confirmation_status": confirmation["status_code"]
                })
            )
            db.add(evidence)
            db.commit()
            logger.error(f"Created new incident {new_incident.id} for monitor {monitor.id}!")

incident_engine = IncidentEngine()
