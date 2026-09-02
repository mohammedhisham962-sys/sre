from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_and_seed_policies():
    response = client.get("/api/v1/policies/")
    assert response.status_code == 200
    policies = response.json()
    assert isinstance(policies, list)
    assert len(policies) >= 3

def test_create_and_toggle_policy():
    create_payload = {
        "name": "Test CI Guardrail",
        "description": "Ensures all tests pass before deployment",
        "trigger_event": "PR_OPENED",
        "action_type": "REQUIRE_HUMAN_APPROVAL",
        "approval_level": "HUMAN_IN_THE_LOOP",
        "is_active": True
    }
    create_res = client.post("/api/v1/policies/", json=create_payload)
    assert create_res.status_code == 200
    new_policy = create_res.json()
    policy_id = new_policy["id"]
    assert new_policy["name"] == "Test CI Guardrail"

    # Toggle policy
    toggle_res = client.put(f"/api/v1/policies/{policy_id}/toggle")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_active"] is False

    # Clean up
    del_res = client.delete(f"/api/v1/policies/{policy_id}")
    assert del_res.status_code == 200

def test_audit_logs_streaming():
    response = client.get("/api/v1/audit/")
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
