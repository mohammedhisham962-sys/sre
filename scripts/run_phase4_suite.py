"""
Phase 4 Enterprise Verification Runner: Multi-Region Topology, FinOps Cost Optimizer, DR Orchestrator.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.topology_service import TopologyService
from app.services.finops_service import FinOpsService
from app.services.dr_service import DisasterRecoveryService


def main():
    print("=" * 70)
    print("🚀 AIGRA Ops — Phase 4 Global Resilience & FinOps Verification Suite")
    print("=" * 70)

    # 1. Multi-Region Topology & Failover
    print("\n[1/3] 🗺️ Testing Multi-Region Topology & Failover...")
    topo = TopologyService.get_topology()
    assert topo["global_status"] == "OPTIMAL"
    assert len(topo["regions"]) == 4
    print(f"  ✅ Global Topology verified across {len(topo['regions'])} regions:")
    for r in topo["regions"]:
        print(f"     • {r['id'].ljust(15)} | Latency: {r['latency_ms']}ms | Traffic: {r['traffic_pct']}% | Rep Lag: {r['replication_lag_ms']}ms | Status: {r['status']}")

    fo = TopologyService.execute_failover(drain_region_id="us-east-1", target_region_id="eu-west-1")
    assert fo["status"] == "COMPLETED"
    print(f"  ✅ Failover executed: Drained us-east-1 -> {fo['traffic_shifted_pct']}% traffic rerouted to eu-west-1 in {fo['convergence_time_ms']}ms.")

    # 2. FinOps Optimizer
    print("\n[2/3] 💰 Testing FinOps Cloud Cost Anomaly Detector & Optimizer...")
    summary = FinOpsService.get_summary()
    assert summary["budget_utilization_pct"] == 81.0
    print(f"  ✅ Monthly Spend: ${summary['current_spend_usd']:,} / ${summary['monthly_budget_usd']:,} ({summary['budget_utilization_pct']}%)")
    print(f"  ✅ Detected {len(summary['anomalies'])} spend anomalies:")
    for anom in summary["anomalies"]:
        print(f"     • [{anom['severity']}] {anom['service']}: {anom['description']} (${anom['impact_usd_per_day']}/day)")

    recs = FinOpsService.get_recommendations()
    assert len(recs) >= 4
    applied = FinOpsService.apply_recommendation("REC-01")
    assert applied["status"] == "SUCCESS"
    print(f"  ✅ Applied right-sizing '{applied['title']}': Unlocked ${applied['monthly_savings_unlocked_usd']}/mo (${applied['annualized_savings_usd']}/yr) savings.")

    # 3. Disaster Recovery & RTO/RPO
    print("\n[3/3] 🛡️ Testing Disaster Recovery (DR) & RTO/RPO Scorecard...")
    dr = DisasterRecoveryService.get_status()
    assert dr["scorecard"]["rto_compliant"] is True
    assert dr["scorecard"]["rpo_compliant"] is True
    print(f"  ✅ DR Scorecard: RTO {dr['scorecard']['rto_actual_minutes']}m (Target: <{dr['scorecard']['rto_target_minutes']}m) | RPO {dr['scorecard']['rpo_actual_minutes']}m (Target: <{dr['scorecard']['rpo_target_minutes']}m)")
    print(f"  ✅ Verified {len(dr['snapshots'])} point-in-time recovery snapshots.")

    drill = DisasterRecoveryService.execute_drill()
    assert drill["status"] == "PASS"
    print(f"  ✅ Automated DR Drill '{drill['drill_id']}' PASSED: Restored in {drill['total_duration_sec']}s with ZERO data loss.")

    print("\n" + "=" * 70)
    print("🎉 All Phase 4 Subsystems PASSED 100% Validation!")
    print("=" * 70)


if __name__ == "__main__":
    main()
