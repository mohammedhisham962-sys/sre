from fastapi import APIRouter
router = APIRouter()
@router.get("/audit")
def get_audit_logs():
    return [{"id": 1, "action": "CREATE_PROJECT", "user": "admin"}]
