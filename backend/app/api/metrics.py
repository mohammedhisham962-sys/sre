from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import Dict, Any
import numpy as np
import time

from ..database import get_db
from ..models.monitor import Monitor, MonitoringResult
from ..models.incident import Incident
from ..models.audit import AuditLog

router = APIRouter()

@router.get("")
@router.get("/")
def get_prometheus_metrics(db: Session = Depends(get_db)):
    """
    Exposes metrics in standard Prometheus text format.
    """
    total_monitors = db.query(Monitor).count()
    active_incidents = db.query(Incident).filter(Incident.status != "RESOLVED").count()
    total_incidents = db.query(Incident).count()
    
    recent_results = db.query(MonitoringResult).order_by(MonitoringResult.id.desc()).limit(200).all()
    latencies = [r.latency_ms for r in recent_results if r.latency_ms is not None]
    up_count = sum(1 for r in recent_results if r.is_up)
    total_checks = len(recent_results)
    
    uptime_ratio = (up_count / total_checks) if total_checks > 0 else 1.0
    p95_latency = float(np.percentile(latencies, 95)) if latencies else 0.0
    p50_latency = float(np.percentile(latencies, 50)) if latencies else 0.0
    
    security_blocks = db.query(AuditLog).filter(AuditLog.event_type == "SECURITY_BLOCK").count()

    lines = [
        "# HELP aigra_monitors_total Total configured monitoring endpoints",
        "# TYPE aigra_monitors_total gauge",
        f"aigra_monitors_total {total_monitors}",
        "",
        "# HELP aigra_incidents_active Current open incidents",
        "# TYPE aigra_incidents_active gauge",
        f"aigra_incidents_active {active_incidents}",
        "",
        "# HELP aigra_incidents_total Total lifetime recorded incidents",
        "# TYPE aigra_incidents_total counter",
        f"aigra_incidents_total {total_incidents}",
        "",
        "# HELP aigra_uptime_ratio Recent uptime ratio (0.0 to 1.0)",
        "# TYPE aigra_uptime_ratio gauge",
        f"aigra_uptime_ratio {uptime_ratio:.4f}",
        "",
        "# HELP aigra_latency_p50_ms 50th percentile response latency in milliseconds",
        "# TYPE aigra_latency_p50_ms gauge",
        f"aigra_latency_p50_ms {p50_latency:.2f}",
        "",
        "# HELP aigra_latency_p95_ms 95th percentile response latency in milliseconds",
        "# TYPE aigra_latency_p95_ms gauge",
        f"aigra_latency_p95_ms {p95_latency:.2f}",
        "",
        "# HELP aigra_security_blocks_total Total intercepted secret violations",
        "# TYPE aigra_security_blocks_total counter",
        f"aigra_security_blocks_total {security_blocks}",
        ""
    ]
    return Response(content="\n".join(lines), media_type="text/plain; version=0.0.4")

@router.get("/slo")
def get_slo_compliance(db: Session = Depends(get_db)):
    """
    Returns structured SLO and SLI compliance metrics for the frontend.
    """
    recent_results = db.query(MonitoringResult).order_by(MonitoringResult.id.desc()).limit(500).all()
    latencies = [r.latency_ms for r in recent_results if r.latency_ms is not None]
    up_count = sum(1 for r in recent_results if r.is_up)
    total_checks = len(recent_results)
    
    actual_uptime_pct = round((up_count / total_checks) * 100, 2) if total_checks > 0 else 100.0
    target_slo_pct = 99.90
    
    # Error budget calculation (allowed downtime percentage = 0.10%)
    allowed_down_pct = 100.0 - target_slo_pct
    actual_down_pct = max(0.0, 100.0 - actual_uptime_pct)
    error_budget_remaining_pct = max(0.0, round(((allowed_down_pct - actual_down_pct) / allowed_down_pct) * 100, 1))

    p50 = float(np.percentile(latencies, 50)) if latencies else 0.0
    p95 = float(np.percentile(latencies, 95)) if latencies else 0.0
    p99 = float(np.percentile(latencies, 99)) if latencies else 0.0
    avg_latency = float(np.mean(latencies)) if latencies else 0.0

    return {
        "target_slo_percentage": target_slo_pct,
        "actual_uptime_percentage": actual_uptime_pct,
        "is_slo_met": actual_uptime_pct >= target_slo_pct,
        "error_budget_remaining_percentage": error_budget_remaining_pct,
        "total_checks_evaluated": total_checks,
        "successful_pings": up_count,
        "failed_pings": total_checks - up_count,
        "latency": {
            "average_ms": round(avg_latency, 1),
            "p50_ms": round(p50, 1),
            "p95_ms": round(p95, 1),
            "p99_ms": round(p99, 1)
        },
        "recent_latencies": latencies[:30]
    }
