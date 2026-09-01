from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
import pytest

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Admin User",
            "email": "admin@aigraops.local",
            "password": "securepassword",
            "role": "ADMIN"
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "admin@aigraops.local"

def test_login_user():
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "admin@aigraops.local",
            "password": "securepassword"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_rbac_protection():
    # Attempt to hit users endpoint without token
    response = client.get("/api/v1/users/")
    assert response.status_code == 401
