from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_fallback():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_api_v1_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_system_diagnostics_endpoint():
    response = client.get("/api/v1/system/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "github" in data
    assert "ai_engine" in data
    assert "scheduler" in data
    assert data["database"]["healthy"] is True
