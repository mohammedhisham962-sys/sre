from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.edge_waf_service import EdgeWafService

router = APIRouter(prefix="/api/v1/edge-waf", tags=["Edge CDN & WAF Controller"])

class PurgeCacheRequest(BaseModel):
    scope: Optional[str] = "global"
    urls: Optional[List[str]] = None

class BlockIpRequest(BaseModel):
    ip_address: str
    reason: str
    duration_hours: Optional[int] = 24

@router.get("/status")
def get_edge_waf_status() -> Dict[str, Any]:
    """Returns global edge CDN PoP health, cache performance, and WAF defense status."""
    return EdgeWafService.get_status()

@router.post("/purge-cache")
def purge_edge_cache(payload: PurgeCacheRequest) -> Dict[str, Any]:
    """Triggers global or targeted cache invalidation across all edge PoPs."""
    return EdgeWafService.purge_cache(
        scope=payload.scope or "global",
        urls=payload.urls
    )

@router.post("/block-ip")
def block_threat_ip(payload: BlockIpRequest) -> Dict[str, Any]:
    """Enforces dynamic IP ban on edge WAF firewalls."""
    if not payload.ip_address:
        raise HTTPException(status_code=400, detail="ip_address is required")
    return EdgeWafService.block_ip(
        ip_address=payload.ip_address,
        reason=payload.reason,
        duration_hours=payload.duration_hours or 24
    )
