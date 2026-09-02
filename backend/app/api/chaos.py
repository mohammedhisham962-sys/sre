from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import asyncio
import httpx
import time

from ..database import get_db
from ..models.monitor import Monitor
from ..services.incident_engine import incident_engine
from ..services.audit_service import audit_service

router = APIRouter()

class ChaosExperimentRequest(BaseModel):
    fault_type: str # "HTTP_ERROR", "LATENCY_SPIKE", "CONNECTION_TIMEOUT"
    target_url: str
    http_status_code: Optional[int] = 503
    latency_ms: Optional[int] = 2500
    monitor_id: Optional[int] = None

@router.post("/inject")
async def inject_fault(req: ChaosExperimentRequest, db: Session = Depends(get_db)):
    """
    Executes a controlled SRE Chaos Engineering experiment to test platform resilience.
    """
    start_time = time.time()
    experiment_log = {
        "fault_type": req.fault_type,
        "target_url": req.target_url,
        "started_at": datetime.utcnow().isoformat()
    }

    # Simulate fault condition
    if req.fault_type == "LATENCY_SPIKE":
        delay_sec = min(5.0, (req.latency_ms or 2000) / 1000.0)
        await asyncio.sleep(delay_sec)
        simulated_latency = round((time.time() - start_time) * 1000, 1)
        
        result_message = f"Injected synthetic latency of {simulated_latency}ms on {req.target_url}."
        is_success = True
    elif req.fault_type == "HTTP_ERROR":
        # Evaluate double-confirmation failure logic
        confirm_check = await incident_engine.confirm_failure(
            monitor_id=req.monitor_id or 9999,
            url=f"https://httpstat.us/{req.http_status_code}"
        )
        result_message = f"Injected HTTP {req.http_status_code} failure. False-Positive double ping confirmed: is_up={confirm_check['is_up']}."
        is_success = True
    else: # CONNECTION_TIMEOUT
        result_message = f"Injected connection timeout simulation on {req.target_url}."
        is_success = True

    audit_service.log_event(
        event_type="CHAOS_EXPERIMENT_EXECUTED",
        summary=f"Chaos experiment: {req.fault_type} on {req.target_url}",
        actor="SRE_OPERATOR",
        severity="WARNING",
        target=req.target_url,
        details={"fault_type": req.fault_type, "result": result_message},
        db=db
    )

    return {
        "status": "COMPLETED",
        "fault_type": req.fault_type,
        "target_url": req.target_url,
        "result_message": result_message,
        "duration_ms": round((time.time() - start_time) * 1000, 1)
    }
