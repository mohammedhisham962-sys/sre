from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_projects_v1():
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_incidents_v1():
    response = client.get("/api/v1/incidents/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_monitors_v1():
    response = client.get("/api/v1/monitoring/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
