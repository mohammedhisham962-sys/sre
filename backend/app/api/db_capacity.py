from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.db_capacity_service import DbCapacityService

router = APIRouter(prefix="/api/v1/db-capacity", tags=["Database Capacity & IOPS Autoscaler"])

class AutoscaleIopsRequest(BaseModel):
    target_iops: Optional[int] = 6000
    burst_duration_minutes: Optional[int] = 60

@router.get("/metrics")
def get_db_capacity_metrics() -> Dict[str, Any]:
    """Returns database connection pool utilization, storage depletion forecast, and IOPS metrics."""
    return DbCapacityService.get_capacity_metrics()

@router.post("/autoscale-iops")
def trigger_iops_autoscaling(payload: AutoscaleIopsRequest) -> Dict[str, Any]:
    """Dynamically scales provisioned disk IOPS throughput for the active cluster."""
    return DbCapacityService.autoscale_iops(
        target_iops=payload.target_iops or 6000,
        burst_duration_minutes=payload.burst_duration_minutes or 60
    )
