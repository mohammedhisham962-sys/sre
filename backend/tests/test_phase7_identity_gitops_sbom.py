import pytest
from app.services.workload_identity_service import WorkloadIdentityService
from app.services.gitops_service import GitOpsService
from app.services.sbom_service import SbomService

def test_workload_identity_status_and_rotation():
    status = WorkloadIdentityService.get_identity_status()
    assert status["status"] == "HEALTHY"
    assert status["enforcement_mode"] == "STRICT_ZERO_TRUST"
    assert len(status["federations"]) >= 4
    assert len(status["secrets"]) >= 5
    
    # Test secret rotation
    rot = WorkloadIdentityService.rotate_secret("sec-pg-prod-rw")
    assert rot["status"] == "SUCCESS"
    assert rot["phase"] == "DUAL_PHASE_VERIFIED"
    assert rot["propagation_time_ms"] > 0

def test_gitops_applications_and_sync():
    apps = GitOpsService.get_applications()
    assert apps["total_applications"] >= 4
    assert apps["synced_count"] >= 1
    assert apps["out_of_sync_count"] >= 1
    
    # Find drifted app
    drifted = next((a for a in apps["applications"] if a["sync_status"] == "OutOfSync"), None)
    assert drifted is not None
    assert len(drifted["diffs"]) > 0
    
    # Test sync execution
    sync_res = GitOpsService.sync_application("finops-agent-helm", prune=True, dry_run=False)
    assert sync_res["action"] == "SYNC_TRIGGERED"
    assert len(sync_res["sync_wave_execution"]) == 4

def test_sbom_overview_and_cyclonedx_export():
    overview = SbomService.get_sbom_overview()
    assert overview["slsa_level"] == "SLSA_LEVEL_3"
    assert overview["cosign_signature"] == "VALID"
    assert len(overview["components"]) >= 6
    
    # Test CycloneDX export
    export_json = SbomService.export_cyclonedx_sbom()
    assert export_json["bomFormat"] == "CycloneDX"
    assert export_json["specVersion"] == "1.5"
    assert len(export_json["components"]) >= 3
