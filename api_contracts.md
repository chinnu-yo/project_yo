# API Contracts & Schemas

## 1. POST `/api/v1/audit/analyze`
Scans connected GitHub repos against chosen target role and returns a Gap Report.

### Request Body
```json
{
  "github_token": "gho_xxxxxxx",
  "target_role": "backend_go_sde1",
  "company_tier": "startup",
  "sprint_duration_days": 7
}
Response Body
JSON
{
  "readiness_score": 68,
  "top_strengths": [
    "Clean directory layout",
    "Active commit history"
  ],
  "detected_gaps": [
    {
      "category": "Testing",
      "issue": "No unit tests found in primary repositories.",
      "severity": "HIGH"
    },
    {
      "category": "Caching",
      "issue": "Missing in-memory caching layer (Redis) for database read ops.",
      "severity": "MEDIUM"
    }
  ],
  "recommended_sprint": {
    "title": "Backend Microservice Refactor & Test Suite",
    "milestones": [
      {
        "step": 1,
        "title": "Add Integration Tests",
        "description": "Write at least 3 unit tests using Go testing package or PyTest for core API handlers.",
        "resource_url": "[https://go.dev/doc/tutorial/add-a-test](https://go.dev/doc/tutorial/add-a-test)"
      },
      {
        "step": 2,
        "title": "Implement Redis Caching",
        "description": "Wrap GET requests with a simple Redis lookup pattern.",
        "resource_url": "[https://redis.io/docs/manual/client-side-caching/](https://redis.io/docs/manual/client-side-caching/)"
      }
    ]
  }
}
2. POST /api/v1/sprint/verify-step
Validates a candidate's proof-of-work submission for a milestone.

Request Body
JSON
{
  "sprint_id": "sp_12345",
  "milestone_step": 1,
  "evidence_url": "[https://github.com/username/repo/pull/4](https://github.com/username/repo/pull/4)"
}
Response Body
JSON
{
  "status": "VERIFIED",
  "message": "PR verified successfully. Milestone 1 complete.",
  "sprint_progress_pct": 50
}