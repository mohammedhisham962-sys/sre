import pytest
from datetime import datetime, timedelta
from app.services.postmortem_service import PostMortemGenerator
from app.services.runbook_runner import RunbookRunner
from app.services.synthetic_prober import SyntheticProber


def test_postmortem_generation_oom():
    now = datetime.utcnow()
    det = now - timedelta(minutes=15)
    res = now

    report = PostMortemGenerator.generate(
        incident_id=201,
        title="OOM Killed in Payment Microservice",
        severity="CRITICAL",
        status="RESOLVED",
        detected_at=det,
        resolved_at=res,
        project_name="Payment Gateway API",
        raw_error_logs="Out of memory: Kill process 42 (node)"
    )

    assert report["incident_id"] == 201
    assert "Memory Exhaustion" in report["category"]
    assert report["metrics"]["ttd_seconds"] == 42
    assert report["metrics"]["tta_seconds"] == 65
    assert report["metrics"]["total_duration_sec"] >= 900
    assert len(report["five_whys"]) == 5
    assert len(report["action_items"]) >= 2
    assert "# Incident Post-Mortem: INC-0201" in report["markdown_report"]


def test_postmortem_generation_timeout():
    report = PostMortemGenerator.generate(
        incident_id=202,
        title="504 Gateway Timeout during Flash Sale",
        severity="HIGH",
        status="RESOLVED",
        detected_at=None,
        resolved_at=None,
        project_name="Checkout Service",
        raw_error_logs="504 Gateway Timeout: connection pool exhausted"
    )

    assert report["incident_id"] == 202
    assert "Gateway Timeout" in report["category"]
    assert len(report["timeline"]) >= 3
    assert "Preventive Action Items" in report["markdown_report"]


def test_runbook_execution_dryrun_and_live():
    # 1. Dry Run
    dry_result = RunbookRunner.execute(runbook_id=1, dry_run=True)
    assert dry_result["runbook_id"] == 1
    assert dry_result["dry_run"] is True
    assert dry_result["status"] == "SUCCESS"
    assert len(dry_result["steps"]) == 4
    assert "[DRY-RUN]" in dry_result["steps"][0]["output"]

    # 2. Live Run
    live_result = RunbookRunner.execute(runbook_id=2, dry_run=False)
    assert live_result["runbook_id"] == 2
    assert live_result["dry_run"] is False
    assert live_result["status"] == "SUCCESS"
    assert "[LIVE EXECUTION]" in live_result["steps"][0]["output"]
    assert live_result["total_duration_ms"] > 0


def test_synthetic_prober_suite_run():
    suites = SyntheticProber.list_suites()
    assert len(suites) >= 3

    # Run Suite 1
    run_res = SyntheticProber.run_suite(suite_id=1)
    assert run_res["suite_id"] == 1
    assert run_res["status"] in ["HEALTHY", "DEGRADED"]
    assert len(run_res["steps"]) == 5
    assert run_res["total_latency_ms"] > 0
    assert all("latency_ms" in s for s in run_res["steps"])
    assert all("cumulative_latency_ms" in s for s in run_res["steps"])
