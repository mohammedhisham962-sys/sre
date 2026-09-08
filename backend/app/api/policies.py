from fastapi import APIRouter
from app.services.policies_service import policies_service
from pydantic import BaseModel

router = APIRouter()

class ManifestRequest(BaseModel):
    manifest_yaml: str

@router.get("/overview")
def get_policies_overview():
    return policies_service.get_policies_overview()

@router.post("/evaluate")
def evaluate_manifest(req: ManifestRequest):
    return policies_service.evaluate_manifest(req.manifest_yaml)
