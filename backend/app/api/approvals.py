from fastapi import APIRouter
router = APIRouter()
@router.post("/{id}/approve")
def approve_action(id: int): return {"status": "approved"}
