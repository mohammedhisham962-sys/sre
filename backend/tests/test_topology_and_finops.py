import pytest
from app.services.topology_service import TopologyService
from app.services.finops_service import FinOpsService
from app.services.dr_service import DisasterRecoveryService


def test_global_topology_and_failover():
    topo = TopologyService.get_topology()
    assert topo["global_status"] == "OPTIMAL"
    assert topo["active_regions_count"] >= 4
    assert topo["total_traffic_pct"] == 100
    assert len(topo["regions"]) == 4

    # Failover us-east-1 -> eu-west-1
    fo = TopologyService.execute_failover(drain_region_id="us-east-1", target_region_id="eu-west-1")
    assert fo["status"] == "COMPLETED"
    assert fo["traffic_shifted_pct"] == 45
    assert fo["drained_region"] == "us-east-1"
    assert fo["target_region"] == "eu-west-1"


def test_finops_summary_and_rightsizing():
    summary = FinOpsService.get_summary()
    assert summary["monthly_budget_usd"] == 10000.0
    assert summary["current_spend_usd"] == 8100.0
    assert len(summary["breakdown"]) >= 5
    assert len(summary["anomalies"]) >= 2

    # Recommendations
    recs = FinOpsService.get_recommendations()
    assert len(recs) >= 4
    assert recs[0]["monthly_savings_usd"] > 0

    # Apply REC-01
    applied = FinOpsService.apply_recommendation("REC-01")
    assert applied["status"] == "SUCCESS"
    assert applied["monthly_savings_unlocked_usd"] == 420.0
    assert applied["annualized_savings_usd"] == 5040.0


def test_dr_scorecard_and_drill():
    dr_stat = DisasterRecoveryService.get_status()
    assert dr_stat["scorecard"]["rto_compliant"] is True
    assert dr_stat["scorecard"]["rpo_compliant"] is True
    assert len(dr_stat["snapshots"]) >= 3

    # Execute drill
    drill = DisasterRecoveryService.execute_drill()
    assert drill["status"] == "PASS"
    assert drill["data_loss_detected"] is False
    assert len(drill["steps"]) == 4
    assert drill["rto_achieved_minutes"] < 15.0
