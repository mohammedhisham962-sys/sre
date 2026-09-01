from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_deployments():
    return [{"id": 1, "status": "SUCCESS", "environment": "production"}]
