"""Gemini LLM Integration Service using google-genai SDK for candidate gap analysis."""

import json
import logging
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.audit import AuditAnalyzeResponse, GapItem, RecommendedSprint, SprintMilestone

logger = logging.getLogger(__name__)


class GeminiService:
    """Service to evaluate candidate repository signals against target job rubrics using Gemini LLM."""

    def __init__(self):
        self.model_name = "gemini-2.5-flash"  # Free-tier model identifier per agent_instructions.md

    def _build_prompt(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> str:
        """Construct deterministic structured prompt for Gemini."""
        return f"""
You are an expert technical interviewer and engineering lead evaluating a candidate's readiness for the role: '{target_role}' at a '{company_tier}' tier company.

Candidate GitHub Code Signals:
- Repositories Count: {signals.get('total_repos', 0)}
- Primary Languages: {', '.join(signals.get('primary_languages', []))}
- Unit Tests Detected: {signals.get('has_unit_tests', False)}
- Docker / Containerization Detected: {signals.get('has_docker', False)}
- Caching Detected: {signals.get('has_caching', False)}
- Frameworks / Libraries: {', '.join(signals.get('detected_frameworks', []))}
- Repositories Breakdown: {json.dumps(signals.get('repos_analyzed', []), indent=2)}

Task:
Perform a gap analysis comparing the candidate's code signals against industry expectations for '{target_role}'.
Create a concise, actionable {sprint_duration_days}-day sprint plan to bridge the candidate's technical gaps.

Return ONLY a valid JSON object matching this exact schema:
{{
  "readiness_score": int (0 to 100),
  "top_strengths": ["string"],
  "detected_gaps": [
    {{
      "category": "string",
      "issue": "string",
      "severity": "HIGH" | "MEDIUM" | "LOW"
    }}
  ],
  "recommended_sprint": {{
    "title": "string",
    "milestones": [
      {{
        "step": 1,
        "title": "string",
        "description": "string",
        "resource_url": "string"
      }}
    ]
  }}
}}
"""

    async def analyze_gaps(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> AuditAnalyzeResponse:
        """Perform candidate gap analysis using Gemini LLM or dynamic fallback rule-engine."""
        
        # If API Key is present, attempt live Gemini SDK call
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = self._build_prompt(signals, target_role, company_tier, sprint_duration_days)
                
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={
                        "response_mime_type": "application/json",
                    }
                )
                
                if response and response.text:
                    parsed_json = json.loads(response.text)
                    return AuditAnalyzeResponse(**parsed_json)
            except Exception as e:
                logger.warning(f"Gemini API call failed or fallback triggered: {e}. Executing rule-engine analysis.")

        # Deterministic Rule Engine Fallback when Gemini API key is missing or call fails
        return self._generate_rule_based_analysis(signals, target_role, company_tier, sprint_duration_days)

    def _generate_rule_based_analysis(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> AuditAnalyzeResponse:
        """Deterministic signal-driven fallback gap analysis."""
        score = 65
        strengths = []
        gaps = []
        milestones = []

        if signals.get("total_repos", 0) > 0:
            strengths.append("Active repository presence and clean directory structure")
        
        langs = signals.get("primary_languages", [])
        if langs:
            strengths.append(f"Demonstrated proficiency in {', '.join(langs)}")

        # Check testing gap
        if not signals.get("has_unit_tests", False):
            gaps.append(
                GapItem(
                    category="Testing",
                    issue="No unit or integration test files found across primary repositories.",
                    severity="HIGH"
                )
            )
            score -= 15
            milestones.append(
                SprintMilestone(
                    step=len(milestones) + 1,
                    title="Add Integration Tests",
                    description=f"Write comprehensive unit and integration tests covering primary handlers for {target_role}.",
                    resource_url="https://pytest.org" if "Python" in str(langs) else "https://go.dev/doc/tutorial/add-a-test"
                )
            )
        else:
            strengths.append("Unit test suites present in project repositories")

        # Check caching / DB gap for backend roles
        if "backend" in target_role.lower():
            if not signals.get("has_caching", False):
                gaps.append(
                    GapItem(
                        category="Caching",
                        issue="Missing in-memory caching layer (Redis) for database read operations.",
                        severity="MEDIUM"
                    )
                )
                score -= 10
                milestones.append(
                    SprintMilestone(
                        step=len(milestones) + 1,
                        title="Implement Redis Caching",
                        description="Wrap high-frequency database GET requests with a Redis caching layer.",
                        resource_url="https://redis.io/docs/manual/client-side-caching/"
                    )
                )

        # Check containerization
        if not signals.get("has_docker", False):
            gaps.append(
                GapItem(
                    category="DevOps & Deployment",
                    issue="Missing Dockerfile / containerization setup for reproducible production deployment.",
                    severity="LOW"
                )
            )

        if not milestones:
            milestones.append(
                SprintMilestone(
                    step=1,
                    title="CI/CD Pipeline Setup",
                    description="Set up GitHub Actions workflow for automated test execution and linting.",
                    resource_url="https://docs.github.com/en/actions"
                )
            )

        final_score = max(30, min(95, score))

        return AuditAnalyzeResponse(
            readiness_score=final_score,
            top_strengths=strengths if strengths else ["Basic git workflow setup"],
            detected_gaps=gaps,
            recommended_sprint=RecommendedSprint(
                title=f"{target_role.replace('_', ' ').title()} Production Refactor & Test Suite",
                milestones=milestones
            )
        )


gemini_service = GeminiService()
