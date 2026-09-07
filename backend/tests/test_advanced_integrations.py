import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.k8s_healer import k8s_healer
from backend.app.services.metrics_forwarder import metrics_forwarder
from backend.app.services.oncall_service import oncall_service
from backend.app.services.canary_guard import canary_guard

client = TestClient(app)

def test_k8s_diagnose_and_heal():
    # 1. Test Diagnosis
    diag_oom = k8s_healer.diagnose_pod(status_phase="OOMKilled", exit_code=137)
    assert diag_oom["issue_type"] == "OOMKilled"
    assert diag_oom["recommended_action"] == "INCREASE_MEMORY_LIMIT"

    diag_crash = k8s_healer.diagnose_pod(status_phase="CrashLoopBackOff", logs="Unhandled exception on startup")
    assert diag_crash["issue_type"] == "CrashLoopBackOff"

    # 2. Test YAML Patch Generation
    patch = k8s_healer.generate_yaml_patch("checkout-service", "OOMKilled", current_memory="256Mi")
    assert "memory: \"1Gi\"" in patch

    # 3. Test API Endpoint
    res = client.get("/api/v1/k8s/pods")
    assert res.status_code == 200
    assert len(res.json()) >= 3

    res_heal = client.post("/api/v1/k8s/heal", json={
        "deployment_name": "payment-worker",
        "namespace": "production",
        "issue_type": "OOMKilled"
    })
    assert res_heal.status_code == 200
    assert res_heal.json()["status"] == "HEALED"

def test_metrics_forwarder():
    sample_metrics = {"p50_latency": 24.5, "p95_latency": 48.0, "error_rate": 0.01}
    
    # Test Datadog Series
    dd_payload = metrics_forwarder.format_datadog_series(sample_metrics)
    assert "series" in dd_payload
    assert len(dd_payload["series"]) == 3
    assert dd_payload["series"][0]["metric"] == "aigra.p50_latency"

    # Test Grafana Prometheus format
    prom_text = metrics_forwarder.format_grafana_prometheus(sample_metrics)
    assert "aigra_p50_latency" in prom_text
    assert "# TYPE aigra_p50_latency gauge" in prom_text

    # Test API Endpoint
    res = client.get("/api/v1/integrations/forwarders")
    assert res.status_code == 200
    assert len(res.json()) == 2

    res_fwd = client.post("/api/v1/integrations/forward", json={"destination": "DATADOG"})
    assert res_fwd.status_code == 200
    assert res_fwd.json()["status"] == "DISPATCHED"

def test_oncall_escalation():
    # Test On-Call Schedule
    schedule = oncall_service.get_current_on_call()
    assert "primary" in schedule
    assert schedule["primary"]["name"] == "Sarah Chen"

    # Test PagerDuty payload formatting
    pd_payload = oncall_service.format_pagerduty_payload(101, "Database Pool Outage", severity="CRITICAL")
    assert pd_payload["event_action"] == "trigger"
    assert pd_payload["dedup_key"] == "aigra-inc-101"

    # Test API Endpoint
    res_sched = client.get("/api/v1/oncall/schedule")
    assert res_sched.status_code == 200
    assert res_sched.json()["primary"]["name"] == "Sarah Chen"

    res_trigger = client.post("/api/v1/oncall/trigger", json={
        "incident_id": 101,
        "title": "Database Pool Outage",
        "severity": "CRITICAL"
    })
    assert res_trigger.status_code == 200
    assert res_trigger.json()["status"] == "PAGED"

def test_canary_guardrails():
    # Test Passing Canary
    pass_result = canary_guard.evaluate_canary(
        canary_version="v2.14.0",
        baseline_latency_ms=25.0,
        canary_latency_ms=26.0,
        baseline_error_rate=0.001,
        canary_error_rate=0.001
    )
    assert pass_result["decision"] == "PROMOTED_TO_PRODUCTION"
    assert pass_result["is_degraded"] is False

    # Test Failing Canary (>15% latency increase)
    fail_result = canary_guard.evaluate_canary(
        canary_version="v2.15.0-bad",
        baseline_latency_ms=20.0,
        canary_latency_ms=35.0, # +75% latency
        baseline_error_rate=0.001,
        canary_error_rate=0.002
    )
    assert fail_result["decision"] == "AUTO_ROLLBACK_TRIGGERED"
    assert fail_result["is_degraded"] is True

    # Test API Endpoint
    res_eval = client.post("/api/v1/canary/evaluate", json={
        "canary_version": "v2.14.0-canary.1",
        "baseline_latency_ms": 25.0,
        "canary_latency_ms": 40.0,
        "baseline_error_rate": 0.001,
        "canary_error_rate": 0.06
    })
    assert res_eval.status_code == 200
    assert res_eval.json()["decision"] == "AUTO_ROLLBACK_TRIGGERED"
