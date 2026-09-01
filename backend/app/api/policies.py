from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_policies():
    return [{"id": 1, "name": "Auto-Repair Low Risk", "action_type": "RESTART"}]
