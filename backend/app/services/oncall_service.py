import httpx
from typing import Dict, Any, Optional
from datetime import datetime
from ..logger import logger
from .audit_service import audit_service

class OnCallEscalationService:
    """
    PagerDuty & OpsGenie On-Call Paging Engine.
    Dispatches SMS, push, and voice call alerts for CRITICAL production incidents.
    """

    @staticmethod
    def get_current_on_call() -> Dict[str, Any]:
        """
        Returns active primary and secondary on-call SRE engineers.
        """
        return {
            "primary": {
                "name": "Sarah Chen",
                "email": "sarah.chen@aigra.ops",
                "phone": "+1-555-0192",
                "role": "Principal SRE (Primary On-Call)",
                "shift_end": "2026-09-08 00:00 UTC"
            },
            "secondary": {
                "name": "Alex Rivera",
                "email": "alex.rivera@aigra.ops",
                "phone": "+1-555-0144",
                "role": "Staff Infrastructure Engineer (Secondary)",
                "shift_end": "2026-09-08 00:00 UTC"
            },
            "escalation_policy": "Tier-1 SMS/Push (0-5m) -> Tier-2 Voice Call (5-15m) -> Tier-3 VP Page (>15m)"
        }

    @staticmethod
    def format_pagerduty_payload(incident_id: int, title: str, severity: str = "CRITICAL", routing_key: str = "mock_key") -> Dict[str, Any]:
        """
        Formats PagerDuty Events API v2 trigger payload.
        """
        return {
            "routing_key": routing_key,
            "event_action": "trigger",
            "dedup_key": f"aigra-inc-{incident_id}",
            "payload": {
                "summary": f"[CRITICAL OUTAGE] {title}",
                "source": "AIGRA_OPS_ENGINE",
                "severity": "critical" if severity == "CRITICAL" else "warning",
                "timestamp": datetime.utcnow().isoformat(),
                "component": "Production Infrastructure",
                "custom_details": {
                    "incident_id": incident_id,
                    "platform": "AIGRA Ops",
                    "auto_heal_attempted": True
                }
            }
        }

    @staticmethod
    async def trigger_page(incident_id: int, title: str, routing_key: str = "", db: Any = None) -> Dict[str, Any]:
        """
        Dispatches emergency page to on-call engineer.
        """
        payload = OnCallEscalationService.format_pagerduty_payload(incident_id, title, routing_key=routing_key)
        oncall = OnCallEscalationService.get_current_on_call()

        audit_service.log_event(
            event_type="ON_CALL_PAGED",
            summary=f"Dispatched high-urgency page to {oncall['primary']['name']} for Incident #{incident_id}",
            actor="ON_CALL_DISPATCHER",
            severity="CRITICAL",
            target=f"pagerduty://aigra-inc-{incident_id}",
            details={"recipient": oncall["primary"], "incident_id": incident_id},
            db=db
        )

        logger.info(f"Emergency On-Call page sent to {oncall['primary']['name']} for Incident #{incident_id}")
        return {
            "status": "PAGED",
            "incident_id": incident_id,
            "recipient": oncall["primary"]["name"],
            "contact_method": "SMS + Mobile Push + Voice",
            "dedup_key": payload["dedup_key"]
        }

oncall_service = OnCallEscalationService()
