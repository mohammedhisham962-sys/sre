from fastapi import APIRouter
router = APIRouter()
@router.get("/scan")
def trigger_scan(): return {"status": "scanning"}
