"""Gemini LLM Integration Service using google-genai SDK with dynamic resource link construction."""

import json
import logging
import urllib.parse
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.audit import AuditAnalyzeResponse, GapItem, RecommendedSprint, SprintMilestone

logger = logging.getLogger(__name__)

# Static dictionary of top-level official documentation homepages
OFFICIAL_DOCS_DOMAINS = {
    "fastapi": "https://fastapi.tiangolo.com",
    "flask": "https://flask.palletsprojects.com",
    "django": "https://docs.djangoproject.com",
    "pytest": "https://docs.pytest.org",
    "sqlalchemy": "https://docs.sqlalchemy.org",
    "pydantic": "https://docs.pydantic.dev",
    "docker": "https://docs.docker.com",
    "redis": "https://redis.io/docs/",
    "go": "https://go.dev/doc/",
    "golang": "https://go.dev/doc/",
    "gin": "https://gin-gonic.com/docs/",
    "react": "https://react.dev",
    "next": "https://nextjs.org/docs",
    "typescript": "https://www.typescriptlang.org/docs/",
    "python": "https://docs.python.org/3/",
    "postgres": "https://www.postgresql.org/docs/",
}


def format_resource_url(search_query: str, resource_type: str) -> str:
    """Construct dynamic, high-quality search or official documentation URLs."""
    encoded_query = urllib.parse.quote_plus(search_query.strip())
    res_type = resource_type.lower().strip()

    if res_type == "youtube":
        return f"https://www.youtube.com/results?search_query={encoded_query}"
    
    if res_type == "freecodecamp":
        return f"https://www.freecodecamp.org/news/search/?query={encoded_query}"

    if res_type == "official_docs":
        # Check if search query mentions a specific domain in our dictionary
        query_lower = search_query.lower()
        for tech_key, domain_url in OFFICIAL_DOCS_DOMAINS.items():
            if tech_key in query_lower:
                return domain_url
        
        # Fallback to targeted Google search for official documentation
        return f"https://www.google.com/search?q={encoded_query}+official+docs"

    # Default fallback
    return f"https://www.google.com/search?q={encoded_query}"


class GeminiService:
    """Service to evaluate candidate repository signals against target job rubrics using Gemini LLM."""

    def __init__(self):
        self.model_name = "gemini-2.5-flash"

    def _build_prompt(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> str:
        """Construct deterministic structured prompt for Gemini."""
        return f"""
You are an expert technical interviewer evaluating candidate code signals for the target role: '{target_role}' at a '{company_tier}' tier company.

Candidate GitHub Code Signals:
- Total Repositories: {signals.get('total_repos', 0)}
- Primary Languages: {', '.join(signals.get('primary_languages', []))}
- Detected Technologies & Frameworks: {', '.join(signals.get('detected_technologies', []))}
- Unit Tests Present: {signals.get('has_unit_tests', False)}
- Docker / Containerization Present: {signals.get('has_docker', False)}
- README Documentation Present: {signals.get('has_readme', False)}
- Caching Layer Present: {signals.get('has_caching', False)}
- Commit Recency: {signals.get('commit_recency', 'recent')}

Scoring Rules & Evaluation Guidelines:
1. FAIR BASE SCORING: For candidates with active repositories and functional code logic, maintain a realistic baseline score between 50 and 70 (out of 100) instead of harshly dropping below 30.
2. ACKNOWLEDGE PROVEN TECH: If 'Detected Technologies & Frameworks' already includes frameworks relevant to '{target_role}' (e.g. FastAPI/Flask for Python backend, Gin/Go for Go backend, React/Next for frontend), DO NOT report missing framework experience.
3. ISOLATED GAPS: Categorize missing README files under 'Documentation & Maintenance' and missing unit tests under 'Testing Practices'.
4. RESOURCE FORMATTING: For each milestone step, provide a concise 'search_query' and a 'resource_type' ('youtube', 'freecodecamp', or 'official_docs').

Return ONLY a valid JSON object matching this exact schema:
{{
  "readiness_score": int (50 to 95),
  "top_strengths": ["string"],
  "detected_gaps": [
    {{
      "category": "Documentation & Maintenance" | "Testing Practices" | "Caching & Architecture" | "DevOps & Infrastructure",
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
        "search_query": "string",
        "resource_type": "youtube" | "freecodecamp" | "official_docs"
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
                    
                    # Convert search_query and resource_type into formatted resource_url
                    milestones = []
                    sprint_data = parsed_json.get("recommended_sprint", {})
                    for raw_m in sprint_data.get("milestones", []):
                        search_q = raw_m.get("search_query") or f"{raw_m.get('title', '')} tutorial"
                        res_t = raw_m.get("resource_type") or "official_docs"
                        url = format_resource_url(search_q, res_t)
                        
                        milestones.append(
                            SprintMilestone(
                                step=raw_m.get("step", 1),
                                title=raw_m.get("title", ""),
                                description=raw_m.get("description", ""),
                                resource_url=url
                            )
                        )

                    gaps = [GapItem(**g) for g in parsed_json.get("detected_gaps", [])]

                    return AuditAnalyzeResponse(
                        readiness_score=max(45, min(95, parsed_json.get("readiness_score", 65))),
                        top_strengths=parsed_json.get("top_strengths", []),
                        detected_gaps=gaps,
                        recommended_sprint=RecommendedSprint(
                            title=sprint_data.get("title", f"{target_role.title()} Sprint Plan"),
                            milestones=milestones
                        )
                    )
            except Exception as e:
                logger.warning(f"Gemini API call failed or fallback triggered: {e}. Executing rule-engine analysis.")

        # Signal-driven fallback rule engine
        return self._generate_rule_based_analysis(signals, target_role, company_tier, sprint_duration_days)

    def _generate_rule_based_analysis(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> AuditAnalyzeResponse:
        """Deterministic signal-driven fallback gap analysis with fair scoring baseline."""
        score = 68
        strengths = []
        gaps = []
        milestones = []

        detected_tech = signals.get("detected_technologies", [])

        # 1. Acknowledge proven tech & repos
        if signals.get("total_repos", 0) > 0:
            strengths.append(f"Active repository presence ({signals.get('total_repos')} repos)")
        
        if detected_tech:
            strengths.append(f"Proven stack experience in {', '.join(detected_tech[:5])}")

        # 2. Check README documentation
        if not signals.get("has_readme", False):
            gaps.append(
                GapItem(
                    category="Documentation & Maintenance",
                    issue="Missing comprehensive README documentation for repository setup and architecture.",
                    severity="MEDIUM"
                )
            )
            score -= 5

        # 3. Check unit testing
        if not signals.get("has_unit_tests", False):
            gaps.append(
                GapItem(
                    category="Testing Practices",
                    issue="No unit or integration test suites found in primary repositories.",
                    severity="HIGH"
                )
            )
            score -= 10
            
            search_q = f"{target_role.replace('_', ' ')} testing tutorial"
            milestones.append(
                SprintMilestone(
                    step=len(milestones) + 1,
                    title="Add Unit & Integration Test Suite",
                    description=f"Write automated unit tests covering key business logic and API endpoints for {target_role}.",
                    resource_url=format_resource_url(search_q, "official_docs")
                )
            )
        else:
            strengths.append("Automated unit test coverage present")

        # 4. Check caching / architecture for backend roles
        if "backend" in target_role.lower():
            if not signals.get("has_caching", False):
                gaps.append(
                    GapItem(
                        category="Caching & Architecture",
                        issue="Missing in-memory caching layer (Redis) for high-frequency database read ops.",
                        severity="MEDIUM"
                    )
                )
                score -= 8
                
                milestones.append(
                    SprintMilestone(
                        step=len(milestones) + 1,
                        title="Implement Redis Caching Layer",
                        description="Wrap frequent database query endpoints with a Redis caching lookup pattern.",
                        resource_url=format_resource_url("Redis caching tutorial", "official_docs")
                    )
                )

        if not milestones:
            milestones.append(
                SprintMilestone(
                    step=1,
                    title="CI/CD GitHub Actions Pipeline",
                    description="Configure automated test execution and linting on pull requests.",
                    resource_url=format_resource_url("GitHub actions CI CD tutorial", "freecodecamp")
                )
            )

        final_score = max(50, min(95, score))

        return AuditAnalyzeResponse(
            readiness_score=final_score,
            top_strengths=strengths if strengths else ["Basic git workflow setup"],
            detected_gaps=gaps,
            recommended_sprint=RecommendedSprint(
                title=f"{target_role.replace('_', ' ').title()} Production Refactor Sprint",
                milestones=milestones
            )
        )


gemini_service = GeminiService()
