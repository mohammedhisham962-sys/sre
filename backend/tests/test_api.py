from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to AIGRA Ops API"}

def test_get_projects():
    response = client.get("/api/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_incidents():
    response = client.get("/api/incidents/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
