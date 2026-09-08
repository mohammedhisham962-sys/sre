from fastapi import APIRouter
from app.services.finops_service import finops_service
from pydantic import BaseModel

router = APIRouter()

class CullRequest(BaseModel):
    resource_id: str

@router.get("/status")
def get_finops_status():
    return finops_service.get_finops_status()

@router.post("/cull")
def cull_idle_resource(req: CullRequest):
    return finops_service.cull_idle_resource(req.resource_id)
