from fastapi import APIRouter
from ..services.compliance_service import ComplianceService

router = APIRouter()

@router.get("/scorecard")
def get_compliance_scorecard():
    """
    Returns automated SOC2 Type II, ISO-27001, and HIPAA compliance readiness scorecards.
    """
    return ComplianceService.get_scorecard()

@router.get("/export")
def export_audit_evidence_package():
    """
    Exports a cryptographically verified compliance evidence package for external auditors.
    """
    return ComplianceService.export_evidence_package()
