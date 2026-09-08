from fastapi import APIRouter
from typing import Dict, Any
from app.services.sbom_service import SbomService

router = APIRouter(prefix="/api/v1/sbom", tags=["Supply Chain Security & SBOM"])

@router.get("/packages")
def get_sbom_packages() -> Dict[str, Any]:
    """Returns SBOM overview, dependency inventory, and vulnerability audit."""
    return SbomService.get_sbom_overview()

@router.get("/export")
def export_sbom() -> Dict[str, Any]:
    """Generates and exports CycloneDX JSON SBOM specification."""
    return SbomService.export_cyclonedx_sbom()
