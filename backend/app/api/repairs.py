from fastapi import APIRouter
router = APIRouter()
@router.post("/")
def create_repair_plan(): return {"status": "created"}
