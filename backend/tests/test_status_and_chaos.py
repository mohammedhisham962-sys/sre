from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_public_status_endpoint():
    response = client.get("/api/v1/status/public")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "services" in data
    assert "incidents" in data

def test_chaos_fault_injection_latency():
    payload = {
        "fault_type": "LATENCY_SPIKE",
        "target_url": "https://httpbin.org/status/200",
        "latency_ms": 500
    }
    response = client.post("/api/v1/chaos/inject", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "duration_ms" in data

def test_chaos_fault_injection_http_error():
    payload = {
        "fault_type": "HTTP_ERROR",
        "target_url": "https://httpstat.us/503",
        "http_status_code": 503
    }
    response = client.post("/api/v1/chaos/inject", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
