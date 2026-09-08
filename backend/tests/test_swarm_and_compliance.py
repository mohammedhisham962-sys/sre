import pytest
from app.services.swarm_service import SwarmService
from app.services.burn_rate_service import BurnRateService
from app.services.compliance_service import ComplianceService


def test_swarm_agents_and_mission():
    status = SwarmService.get_swarm_status()
    assert status["swarm_status"] == "ONLINE"
    assert status["active_agents_count"] == 5
    assert status["total_tokens_consumed"] > 50000
    assert len(status["agents"]) == 5

    # Launch Mission
    mission = SwarmService.launch_mission("Full Cluster Security & Resilience Audit")
    assert mission["status"] == "COMPLETED"
    assert mission["scorecard"] == "100% HEALTHY"
    assert len(mission["steps"]) == 5
    assert mission["total_duration_ms"] > 0


def test_burn_rate_and_deployment_freeze():
    br = BurnRateService.get_status()
    assert len(br["burn_windows"]) == 4
    assert len(br["services"]) >= 3
    assert br["global_burn_rate"] > 0

    # Toggle freeze on svc-events
    frozen = BurnRateService.toggle_freeze(service_id="svc-events", freeze=True)
    assert frozen["deployment_frozen"] is True
    assert frozen["action"] == "DEPLOYMENT_FREEZE_ENGAGED"

    # Release freeze
    released = BurnRateService.toggle_freeze(service_id="svc-events", freeze=False)
    assert released["deployment_frozen"] is False
    assert released["action"] == "DEPLOYMENT_FREEZE_RELEASED"


def test_compliance_scorecard_and_export():
    card = ComplianceService.get_scorecard()
    assert card["overall_status"] == "AUDIT_READY"
    assert card["compliance_score_pct"] >= 95.0
    assert len(card["controls"]) >= 6
    assert all(c["status"] == "COMPLIANT" for c in card["controls"])

    # Export Package
    pkg = ComplianceService.export_evidence_package()
    assert "AUDIT-PKG-" in pkg["package_id"]
    assert pkg["certification_status"] == "PASSED (100% Verified)"
    assert len(pkg["evidence_items"]) >= 6
