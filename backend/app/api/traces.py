from fastapi import APIRouter
from ..services.tracing_service import TracingService

router = APIRouter()

@router.get("/recent")
def list_recent_traces():
    """
    Returns recent OpenTelemetry distributed trace sessions with P99 bottleneck status.
    """
    return TracingService.get_recent_traces()

@router.get("/{trace_id}")
def get_trace_details(trace_id: str):
    """
    Returns full span waterfall tree and query attributes for a specific trace ID.
    """
    return TracingService.get_trace_by_id(trace_id=trace_id)
