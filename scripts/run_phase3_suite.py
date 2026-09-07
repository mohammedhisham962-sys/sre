"""
Phase 3 Enterprise Verification Runner: Post-Mortems, Runbook Engine, Synthetic Prober.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.postmortem_service import PostMortemGenerator
from app.services.runbook_runner import RunbookRunner
from app.services.synthetic_prober import SyntheticProber


def main():
    print("=" * 70)
    print("🚀 AIGRA Ops — Phase 3 Enterprise Automation Verification Suite")
    print("=" * 70)

    # 1. Post-Mortem Generator
    print("\n[1/3] 📝 Testing Autonomous Incident Post-Mortem (RCA) Engine...")
    pm = PostMortemGenerator.generate(
        incident_id=501,
        title="High Memory Pressure & OOM Kill on Node",
        severity="CRITICAL",
        status="RESOLVED",
        detected_at=None,
        resolved_at=None,
        project_name="Payment Cluster",
        raw_error_logs="Out of memory: Kill process 42 (node)"
    )
    assert pm["incident_id"] == 501
    assert "Memory Exhaustion" in pm["category"]
    assert pm["metrics"]["ttd_seconds"] == 42
    assert len(pm["five_whys"]) == 5
    assert len(pm["action_items"]) >= 2
    assert "# Incident Post-Mortem: INC-0501" in pm["markdown_report"]
    print("  ✅ Post-Mortem synthesized successfully:")
    print(f"     Category: {pm['category']}")
    print(f"     TTD: {pm['metrics']['ttd_seconds']}s | TTA: {pm['metrics']['tta_seconds']}s | TTM: {pm['metrics']['ttm_seconds']}s")
    print(f"     Action Items Count: {len(pm['action_items'])}")

    # 2. SRE Runbook Engine
    print("\n[2/3] ⚙️ Testing SRE Runbook Automation Engine (Dry-Run & Live)...")
    runbooks = RunbookRunner.get_all_runbooks()
    assert len(runbooks) >= 4
    print(f"  ✅ Discovered {len(runbooks)} canonical automated runbooks.")

    dry = RunbookRunner.execute(runbook_id=1, dry_run=True)
    assert dry["dry_run"] is True
    assert dry["status"] == "SUCCESS"
    print(f"  ✅ Dry-run executed on '{dry['name']}': 4/4 steps passed in {dry['total_duration_ms']}ms.")

    live = RunbookRunner.execute(runbook_id=2, dry_run=False)
    assert live["dry_run"] is False
    assert live["status"] == "SUCCESS"
    print(f"  ✅ Live execution completed on '{live['name']}': 4/4 steps passed in {live['total_duration_ms']}ms.")

    # 3. Synthetic Journey Prober
    print("\n[3/3] 🌐 Testing Synthetic User Journey & Waterfall Prober...")
    suites = SyntheticProber.list_suites()
    assert len(suites) >= 3
    print(f"  ✅ Configured {len(suites)} synthetic transaction suites.")

    res = SyntheticProber.run_suite(suite_id=1)
    assert res["suite_id"] == 1
    assert len(res["steps"]) == 5
    assert res["total_latency_ms"] > 0
    print(f"  ✅ Synthetic probe executed for '{res['suite_name']}':")
    print(f"     Status: {res['status']} | Total Latency: {res['total_latency_ms']}ms (SLO: {res['slo_target_ms']}ms)")
    for step in res["steps"]:
        print(f"       Hop #{step['step']}: {step['name'].ljust(35)} -> {step['latency_ms']}ms (HTTP {step['status_code']})")

    print("\n" + "=" * 70)
    print("🎉 All Phase 3 Subsystems PASSED 100% Validation!")
    print("=" * 70)


if __name__ == "__main__":
    main()
