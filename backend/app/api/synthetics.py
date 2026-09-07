from fastapi import APIRouter, Query
from typing import List, Optional
from ..services.synthetic_prober import SyntheticProber
from pydantic import BaseModel

router = APIRouter()

class SyntheticRunRequest(BaseModel):
    suite_id: int = 1

@router.get("/suites")
def list_synthetic_suites():
    """
    Returns all configured multi-step synthetic transaction suites.
    """
    return SyntheticProber.list_suites()

@router.post("/run")
def run_synthetic_probe(req: Optional[SyntheticRunRequest] = None, suite_id: int = Query(1)):
    """
    Executes a synthetic end-to-end multi-step transaction probe and returns latency waterfall breakdown.
    """
    target_id = suite_id
    if req and req.suite_id:
        target_id = req.suite_id

    return SyntheticProber.run_suite(suite_id=target_id)

@router.get("/status")
def get_synthetics_status():
    """
    Executes and aggregates telemetry for all synthetic suites.
    """
    suites = SyntheticProber.list_suites()
    results = [SyntheticProber.run_suite(s["id"]) for s in suites]
    return {
        "total_suites": len(suites),
        "all_healthy": all(r["status"] == "HEALTHY" for r in results),
        "results": results
    }
