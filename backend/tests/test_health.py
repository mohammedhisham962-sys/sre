from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check_v1():
    response = client.get("/api/v1/health")
    # This will likely return 503 if postgres/redis are not running locally during testing,
    # but the endpoint itself should respond with a JSON indicating status.
    assert response.status_code in [200, 503]
    json_data = response.json()
    assert "backend" in json_data
    assert "database" in json_data
    assert "redis" in json_data
