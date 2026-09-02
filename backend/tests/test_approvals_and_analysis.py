from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_and_seed_approvals():
    response = client.get("/api/v1/approvals/")
    assert response.status_code == 200
    approvals = response.json()
    assert isinstance(approvals, list)
    assert len(approvals) >= 1

def test_approve_and_reject_flow():
    create_payload = {
        "title": "QA Automated Test Promotion",
        "description": "Test approval flow",
        "action_type": "PROD_MERGE",
        "target_environment": "staging"
    }
    create_res = client.post("/api/v1/approvals/", json=create_payload)
    assert create_res.status_code == 200
    approval_id = create_res.json()["id"]

    # Approve
    approve_res = client.post(f"/api/v1/approvals/{approval_id}/approve", json={"reviewer_name": "QA Bot", "notes": "Approved in unit test."})
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

def test_ai_post_mortem_generation():
    req_payload = {
        "custom_logs": "Traceback: ZeroDivisionError: division by zero in worker_job.py line 42",
        "title": "Unit Test Division Incident"
    }
    response = client.post("/api/v1/analysis/post-mortem", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "report_markdown" in data
    assert len(data["report_markdown"]) > 50
