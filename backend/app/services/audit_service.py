import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.audit import AuditLog
from ..logger import logger

class AuditService:
    @staticmethod
    def log_event(
        event_type: str,
        summary: str,
        actor: str = "SYSTEM",
        severity: str = "INFO",
        target: str = None,
        details: dict = None,
        db: Session = None
    ):
        """
        Records an audit event in the database.
        Can receive an existing DB session or open a scoped session.
        """
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True

        try:
            details_str = json.dumps(details) if details else None
            audit_entry = AuditLog(
                timestamp=datetime.utcnow(),
                event_type=event_type,
                actor=actor,
                severity=severity,
                target=target,
                summary=summary,
                details_json=details_str
            )
            db.add(audit_entry)
            db.commit()
            logger.info(f"[AUDIT] {severity} | {event_type} | {summary}")
        except Exception as e:
            logger.error(f"Failed to write audit log: {str(e)}")
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            if should_close:
                db.close()

audit_service = AuditService()
