"""Backend API verification test script."""

import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify health check endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("[PASS] Health check test passed:", data)


def test_audit_analyze_endpoint():
    """Verify POST /api/v1/audit/analyze adheres strictly to api_contracts.md."""
    payload = {
        "github_token": "mock_gho_123456789",
        "target_role": "backend_go_sde1",
        "company_tier": "startup",
        "sprint_duration_days": 7
    }
    response = client.post("/api/v1/audit/analyze", json=payload)
    assert response.status_code == 200, f"Failed with {response.status_code}: {response.text}"
    data = response.json()
    
    # Assert fields from api_contracts.md schema
    assert "readiness_score" in data
    assert isinstance(data["readiness_score"], int)
    assert "top_strengths" in data
    assert "recommended_projects" in data
    assert len(data["recommended_projects"]) == 3
    assert "title" in data["recommended_projects"][0]
    assert "tech_stack" in data["recommended_projects"][0]
    assert len(data["recommended_projects"][0]["key_features"]) > 0
    print("[PASS] Audit analyze endpoint test passed (with 3 recommended projects). Score:", data["readiness_score"])


def test_sprint_verify_step_endpoint():
    """Verify POST /api/v1/sprint/verify-step adheres strictly to api_contracts.md."""
    # 1. Test valid PR URL (real merged PR on GitHub)
    valid_payload = {
        "sprint_id": "sp_12345",
        "milestone_step": 1,
        "evidence_url": "https://github.com/fastapi/fastapi/pull/1"
    }
    response = client.post("/api/v1/sprint/verify-step", json=valid_payload)
    assert response.status_code == 200, f"Failed with {response.status_code}: {response.text}"
    data = response.json()
    assert data["status"] == "VERIFIED"
    assert "message" in data
    assert "sprint_progress_pct" in data
    assert "recalculated_score" in data
    assert "resolved_gap" in data
    print("[PASS] Sprint verify-step endpoint (valid PR with score boost) passed:", data)

    # 2. Test invalid/dummy PR URL
    invalid_payload = {
        "sprint_id": "sp_12345",
        "milestone_step": 1,
        "evidence_url": "https://github.com/candidate/sample-backend-service/pull/1"
    }
    response = client.post("/api/v1/sprint/verify-step", json=invalid_payload)
    assert response.status_code == 200, f"Failed with {response.status_code}: {response.text}"
    data = response.json()
    assert data["status"] == "FAILED"
    assert data["message"] == "Invalid or non-existent GitHub Pull Request URL."
    print("[PASS] Sprint verify-step endpoint (invalid PR rejection) passed:", data)


if __name__ == "__main__":
    test_health_check()
    test_audit_analyze_endpoint()
    test_sprint_verify_step_endpoint()
    print("\n[SUCCESS] ALL BACKEND API CONTRACT TESTS PASSED SUCCESSFULLY!")
