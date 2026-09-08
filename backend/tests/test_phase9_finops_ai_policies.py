import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_finops_status():
    response = client.get("/api/v1/finops/status")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "idle_resources" in data
    assert "anomalies" in data
    assert data["summary"]["daily_budget"] > 0

def test_finops_cull():
    response = client.post("/api/v1/finops/cull", json={"resource_id": "disk-1a2b3c"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "error"]

def test_aiops_assistant_context():
    response = client.get("/api/v1/assistant/context")
    assert response.status_code == 200
    data = response.json()
    assert "active_incidents" in data
    assert len(data["active_incidents"]) > 0

def test_aiops_assistant_analyze():
    response = client.get("/api/v1/assistant/analyze/INC-8891")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-8891"
    assert "root_cause_summary" in data
    assert data["confidence_score"] > 0.9

def test_policies_overview():
    response = client.get("/api/v1/policies/overview")
    assert response.status_code == 200
    data = response.json()
    assert "policies" in data
    assert "evaluations" in data

def test_policies_evaluate():
    yaml = "apiVersion: v1\nkind: Pod\nmetadata:\n  name: test\nspec:\n  containers:\n  - name: c1\n    securityContext:\n      privileged: true"
    response = client.post("/api/v1/policies/evaluate", json={"manifest_yaml": yaml})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "DENY"
    assert len(data["violations"]) > 0
