from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from ..database import get_db
from ..models.monitor import Monitor, MonitoringResult
from ..models.incident import Incident

router = APIRouter()

@router.get("/public")
def get_public_status(db: Session = Depends(get_db)):
    """
    Returns public-facing system status, uptime percentages, and recent incidents.
    Does not expose sensitive credentials or internal host details.
    """
    monitors = db.query(Monitor).filter(Monitor.is_active == True).all()
    open_incidents = db.query(Incident).filter(Incident.status != "RESOLVED").all()
    recent_incidents = db.query(Incident).order_by(Incident.id.desc()).limit(5).all()

    overall_status = "OPERATIONAL"
    if open_incidents:
        critical_count = sum(1 for i in open_incidents if i.severity == "CRITICAL")
        overall_status = "MAJOR_OUTAGE" if critical_count > 0 else "DEGRADED_PERFORMANCE"

    services_data = []
    for m in monitors:
        results = db.query(MonitoringResult).filter(MonitoringResult.monitor_id == m.id).order_by(MonitoringResult.id.desc()).limit(60).all()
        up_count = sum(1 for r in results if r.is_up)
        total_checks = len(results)
        uptime_pct = round((up_count / total_checks) * 100, 1) if total_checks > 0 else 100.0
        
        # Build 30-day mini status bars (each block represents a sample check)
        history_bars = [("UP" if r.is_up else "DOWN") for r in reversed(results[:30])]
        if not history_bars:
            history_bars = ["UP"] * 30

        services_data.append({
            "id": m.id,
            "name": m.name,
            "status": "OPERATIONAL" if (results and results[0].is_up) else "DEGRADED" if results else "OPERATIONAL",
            "uptime_percentage": uptime_pct,
            "last_check_ms": results[0].latency_ms if results else None,
            "history": history_bars
        })

    formatted_incidents = []
    for inc in recent_incidents:
        formatted_incidents.append({
            "id": inc.id,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
            "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
            "description": inc.description
        })

    return {
        "status": overall_status,
        "updated_at": datetime.utcnow().isoformat(),
        "services": services_data,
        "incidents": formatted_incidents
    }
