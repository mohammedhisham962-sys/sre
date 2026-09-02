from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_prometheus_metrics_exposition():
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    text = response.text
    assert "aigra_monitors_total" in text
    assert "aigra_incidents_active" in text
    assert "aigra_uptime_ratio" in text

def test_slo_compliance_json():
    response = client.get("/api/v1/metrics/slo")
    assert response.status_code == 200
    data = response.json()
    assert "target_slo_percentage" in data
    assert "actual_uptime_percentage" in data
    assert "error_budget_remaining_percentage" in data
    assert "latency" in data

def test_backup_export_snapshot():
    response = client.get("/api/v1/backup/export")
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert data["metadata"]["platform"] == "AIGRA_OPS"
    assert "projects" in data
    assert "monitors" in data

def test_webhook_crud_and_test():
    create_payload = {
        "name": "Unit Test Slack Channel",
        "url": "https://httpbin.org/post",
        "channel_type": "SLACK"
    }
    create_res = client.post("/api/v1/webhooks/", json=create_payload)
    assert create_res.status_code == 200
    wh_id = create_res.json()["id"]

    # Test webhook
    test_res = client.post(f"/api/v1/webhooks/{wh_id}/test")
    assert test_res.status_code == 200

    # Delete
    del_res = client.delete(f"/api/v1/webhooks/{wh_id}")
    assert del_res.status_code == 200
