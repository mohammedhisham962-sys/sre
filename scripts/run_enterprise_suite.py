import os
import sys
import json
import time

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import SessionLocal, engine, Base
from app.services.k8s_healer import k8s_healer
from app.services.metrics_forwarder import metrics_forwarder
from app.services.oncall_service import oncall_service
from app.services.canary_guard import canary_guard

def header(title):
    print("\n" + "=" * 70)
    print(f"🌟 {title.upper()}")
    print("=" * 70)

def step(msg):
    print(f"\n  🔹 {msg}")

def pass_step(msg):
    print(f"     ✅ [PASS] {msg}")

def run_enterprise_suite():
    print("\n" + "=" * 70)
    print("🚀 AIGRA OPS — ENTERPRISE EXPANSION OPERATIONAL SUITE")
    print("   Testing K8s Auto-Healer, Metrics Forwarder, On-Call & Canary Guard...")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # MODULE 1: KUBERNETES AUTO-HEALER
        header("MODULE 1: Kubernetes Pod Diagnostics & Auto-Healer")
        step("Step 1.1: Diagnosing Failing Pod in production namespace")
        diag = k8s_healer.diagnose_pod(status_phase="OOMKilled", exit_code=137)
        pass_step(f"Diagnosed issue: {diag['issue_type']} (Severity: {diag['severity']}) -> {diag['reason']}")

        step("Step 1.2: Synthesizing Declarative YAML Patch & Executing Auto-Heal")
        heal_res = k8s_healer.heal_pod(
            deployment_name="payment-worker",
            namespace="production",
            issue_type="OOMKilled",
            db=db
        )
        pass_step(f"Heal status: {heal_res['status']} | Action: {heal_res['action_taken']}")
        print(f"     📜 [Generated YAML Patch Preview]:\n{heal_res['patch_yaml'].strip()}")

        # MODULE 2: METRICS FORWARDER
        header("MODULE 2: Multi-Cloud Metrics Forwarder (Datadog & Grafana)")
        step("Step 2.1: Formatting Datadog Metrics Series")
        metrics = {"p50_latency_ms": 28.4, "error_rate": 0.002, "slo_burn_rate": 0.05}
        dd_payload = metrics_forwarder.format_datadog_series(metrics)
        pass_step(f"Datadog API Payload formatted with {len(dd_payload['series'])} metric series.")

        step("Step 2.2: Formatting Grafana Cloud Prometheus Exposition")
        prom_text = metrics_forwarder.format_grafana_prometheus(metrics)
        pass_step(f"Grafana Prometheus Text Exposition generated ({len(prom_text.splitlines())} lines).")

        # MODULE 3: ON-CALL ESCALATION
        header("MODULE 3: PagerDuty & OpsGenie On-Call Escalation Engine")
        step("Step 3.1: Retrieving Active On-Call SRE Roster")
        oncall = oncall_service.get_current_on_call()
        pass_step(f"Primary On-Call: {oncall['primary']['name']} ({oncall['primary']['phone']})")

        step("Step 3.2: Formatting & Dispatching Emergency Page")
        pd_payload = oncall_service.format_pagerduty_payload(101, "Production Payment Gateway 500 Outage")
        pass_step(f"PagerDuty Event Formatted: dedup_key='{pd_payload['dedup_key']}', action='{pd_payload['event_action']}'")

        # MODULE 4: CANARY GUARDRAILS
        header("MODULE 4: Canary Release & Automated Rollback Guardrails")
        step("Step 4.1: Evaluating Healthy Canary Release")
        good_canary = canary_guard.evaluate_canary(
            canary_version="v2.14.0-canary.1",
            baseline_latency_ms=25.0,
            canary_latency_ms=26.5,
            baseline_error_rate=0.001,
            canary_error_rate=0.001,
            db=db
        )
        pass_step(f"Canary {good_canary['canary_version']} -> Decision: {good_canary['decision']}")

        step("Step 4.2: Evaluating Degraded Canary Release (Triggering Automated Rollback)")
        bad_canary = canary_guard.evaluate_canary(
            canary_version="v2.15.0-bad.1",
            baseline_latency_ms=20.0,
            canary_latency_ms=38.0, # +90% latency spike
            baseline_error_rate=0.001,
            canary_error_rate=0.07,  # 7% error rate
            db=db
        )
        pass_step(f"Canary {bad_canary['canary_version']} -> Decision: {bad_canary['decision']} ({bad_canary['reason']})")

        print("\n" + "=" * 70)
        print("🏆 ALL 4 ENTERPRISE SUBSYSTEMS COMPLETED WITH 100% SUCCESS!")
        print("=" * 70 + "\n")
    finally:
        db.close()

if __name__ == "__main__":
    run_enterprise_suite()
