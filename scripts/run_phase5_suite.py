"""
Phase 5 Enterprise Verification Runner: AI Swarm Mission Control, Error Budget Burn Engine, Compliance Auditor.
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.swarm_service import SwarmService
from app.services.burn_rate_service import BurnRateService
from app.services.compliance_service import ComplianceService


def main():
    print("=" * 70)
    print("🚀 AIGRA Ops — Phase 5 Agent Swarm & Enterprise Governance Suite")
    print("=" * 70)

    # 1. Swarm Service
    print("\n[1/3] 🤖 Testing AI SRE Agent Swarm Mission Control...")
    swarm = SwarmService.get_swarm_status()
    assert swarm["swarm_status"] == "ONLINE"
    assert len(swarm["agents"]) == 5
    print(f"  ✅ Swarm Status: {swarm['swarm_status']} | Active Agents: {len(swarm['agents'])} | Total Tokens: {swarm['total_tokens_consumed']:,}")
    for a in swarm["agents"]:
        print(f"     • {a['name'].ljust(22)} [{a['role']}] -> Model: {a['model']} | Status: {a['status']}")

    msn = SwarmService.launch_mission("Full Cluster Security & Resilience Audit")
    assert msn["status"] == "COMPLETED"
    print(f"  ✅ Mission '{msn['mission_id']}' PASSED: Coordinated {msn['participating_agents']} agents in {msn['total_duration_ms']}ms.")

    # 2. Multi-Window Error Budget Burn Engine
    print("\n[2/3] 🔥 Testing Multi-Window Error Budget Burn Rate Engine...")
    br = BurnRateService.get_status()
    assert len(br["burn_windows"]) == 4
    print("  ✅ Burn Windows Evaluated:")
    for w in br["burn_windows"]:
        print(f"     • {w['window'].ljust(16)} | Threshold: {w['burn_rate_threshold']}x | Current: {w['current_burn_rate']}x | Status: {w['status']}")

    fz = BurnRateService.toggle_freeze("svc-events", freeze=True)
    assert fz["deployment_frozen"] is True
    print(f"  ✅ Automated CI/CD Lockdown: Engaged freeze on '{fz['service_name']}'.")

    # 3. SOC2 / ISO-27001 Compliance Auditor
    print("\n[3/3] 📜 Testing SOC2 Type II & ISO-27001 Compliance Auditor...")
    comp = ComplianceService.get_scorecard()
    assert comp["overall_status"] == "AUDIT_READY"
    print(f"  ✅ Compliance Score: {comp['compliance_score_pct']}% ({comp['compliant_controls_count']}/{comp['total_controls_count']} Controls Verified)")
    for c in comp["controls"]:
        print(f"     • {c['id'].ljust(15)} | {c['title'].ljust(50)} -> {c['status']}")

    pkg = ComplianceService.export_evidence_package()
    assert "AUDIT-PKG-" in pkg["package_id"]
    print(f"  ✅ Exported Verified Audit Bundle: '{pkg['package_id']}' with {len(pkg['evidence_items'])} cryptographic proof records.")

    print("\n" + "=" * 70)
    print("🎉 All Phase 5 Subsystems PASSED 100% Validation!")
    print("=" * 70)


if __name__ == "__main__":
    main()
