"""Gemini LLM Integration Service using google-genai SDK with dynamic resource link construction."""

import json
import logging
import urllib.parse
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.audit import (
    AuditAnalyzeResponse, 
    GapItem, 
    RecommendedSprint, 
    SprintMilestone,
    ProjectRecommendation
)

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


def filter_grounded_strengths(strengths: List[str], signals: Dict[str, Any]) -> List[str]:
    """Ensure model or rule engine strengths do not list Docker, PyTest, README, or Caching unless boolean is True."""
    has_tests = signals.get("has_unit_tests", False) or signals.get("has_tests", False)
    has_docker = signals.get("has_docker", False)
    has_readme = signals.get("has_readme", False)
    has_caching = signals.get("has_caching", False)

    grounded = []
    for s in strengths:
        s_lower = s.lower()
        if not has_docker and ("docker" in s_lower or "container" in s_lower):
            continue
        if not has_tests and ("pytest" in s_lower or "unit test" in s_lower or "test coverage" in s_lower or "testing" in s_lower):
            continue
        if not has_readme and ("readme" in s_lower or "documentation" in s_lower):
            continue
        if not has_caching and ("caching" in s_lower or "redis" in s_lower):
            continue
        grounded.append(s)

    return grounded if grounded else ["Git workflow setup & repository structure"]


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
        has_tests = signals.get('has_unit_tests', False) or signals.get('has_tests', False)
        has_docker = signals.get('has_docker', False)
        has_readme = signals.get('has_readme', False)
        has_caching = signals.get('has_caching', False)

        return f"""
You are an expert technical interviewer evaluating candidate code signals for the target role: '{target_role}' at a '{company_tier}' tier company.

Candidate GitHub Code Signals:
- Total Repositories: {signals.get('total_repos', 0)}
- Primary Languages: {', '.join(signals.get('primary_languages', []))}
- Detected Technologies & Frameworks: {', '.join(signals.get('detected_technologies', []))}
- Unit Tests Present (has_tests / has_unit_tests): {has_tests}
- Docker / Containerization Present (has_docker): {has_docker}
- README Documentation Present (has_readme): {has_readme}
- Caching Layer Present (has_caching): {has_caching}
- Commit Recency: {signals.get('commit_recency', 'recent')}

STRICT GROUNDING RULES (MANDATORY):
1. Gemini MUST NOT list Docker, PyTest, README, or Caching as a 'VERIFIED CODE STRENGTH' or in 'top_strengths' unless the boolean signal explicitly evaluates to True in the payload above:
   - Do NOT list Docker or containerization in top_strengths unless has_docker is True.
   - Do NOT list PyTest, unit tests, or test coverage in top_strengths unless has_tests (or has_unit_tests) is True.
   - Do NOT list README or documentation in top_strengths unless has_readme is True.
   - Do NOT list Caching or Redis in top_strengths unless has_caching is True.

ACCURATE SCORING CALIBRATION:
1. Establish a realistic baseline readiness score between 60 and 70 (out of 100) if core frameworks/languages are present for '{target_role}'.
2. Apply strict deductions based on missing components:
   - Deduct 10 points if unit tests are missing (has_tests is False).
   - Deduct 8 points if caching is missing (has_caching is False) for backend roles.
   - Deduct 5 points if Docker containerization is missing (has_docker is False).
   - Deduct 5 points if README documentation is missing (has_readme is False).
3. Final readiness_score must accurately reflect these deductions, bounded between 45 and 95.

RECOMMENDED PERSONALIZED PROJECTS (MANDATORY):
- Generate exactly 3 curated enterprise or startup grade portfolio projects based directly on the detected gaps for '{target_role}'.
- Avoid generic projects (no simple To-Do apps, basic calculators, or plain CRUDs).

Return ONLY a valid JSON object matching this exact schema:
{{
  "readiness_score": int (45 to 95),
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
  }},
  "recommended_projects": [
    {{
      "id": "proj_1",
      "title": "string",
      "description": "string",
      "tech_stack": ["string", "string"],
      "key_features": ["string", "string", "string"],
      "portfolio_impact": "string"
    }}
  ]
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
                    raw_strengths = parsed_json.get("top_strengths", [])
                    grounded_strengths = filter_grounded_strengths(raw_strengths, signals)

                    raw_projects = parsed_json.get("recommended_projects", [])
                    projects = []
                    for idx, p in enumerate(raw_projects, start=1):
                        if isinstance(p, dict):
                            p_id = p.get("id") or f"proj_{idx}"
                            p_title = p.get("title", f"Portfolio Project #{idx}")
                            p_desc = p.get("description") or p.get("problem_statement") or "Enterprise grade microservice."
                            p_stack = p.get("tech_stack")
                            if isinstance(p_stack, str):
                                p_stack_list = [s.strip() for s in p_stack.replace("+", ",").split(",") if s.strip()]
                            elif isinstance(p_stack, list):
                                p_stack_list = [str(s) for s in p_stack]
                            else:
                                p_stack_list = ["FastAPI", "Redis", "Docker", "PyTest"]
                            p_feats = p.get("key_features", ["Feature 1", "Feature 2", "Feature 3"])
                            p_impact = p.get("portfolio_impact", "High value resume project.")

                            projects.append(ProjectRecommendation(
                                id=p_id,
                                title=p_title,
                                description=p_desc,
                                tech_stack=p_stack_list,
                                key_features=p_feats,
                                portfolio_impact=p_impact
                            ))

                    if not projects:
                        projects = self._generate_default_projects(target_role)

                    return AuditAnalyzeResponse(
                        readiness_score=max(45, min(95, parsed_json.get("readiness_score", 65))),
                        top_strengths=grounded_strengths,
                        detected_gaps=gaps,
                        recommended_sprint=RecommendedSprint(
                            title=sprint_data.get("title", f"{target_role.title()} Sprint Plan"),
                            milestones=milestones
                        ),
                        recommended_projects=projects
                    )
            except Exception as e:
                logger.warning(f"Gemini API call failed or fallback triggered: {e}. Executing rule-engine analysis.")

        # Signal-driven fallback rule engine
        return self._generate_rule_based_analysis(signals, target_role, company_tier, sprint_duration_days)

    def _generate_default_projects(self, target_role: str) -> List[ProjectRecommendation]:
        """Generate 3 curated high-impact portfolio projects tailored to target role gaps."""
        if "go" in target_role.lower():
            p1 = ProjectRecommendation(
                id="proj_1",
                title="Distributed High-Concurrency Rate Limiter Microservice",
                description="Protects microservices from DDoS traffic spikes and token bucket resource exhaustion. Implements sliding window concurrency control with Redis.",
                tech_stack=["Go", "Gin", "Redis", "Docker", "GoTest"],
                key_features=[
                    "Sliding window algorithm backed by Redis memory store",
                    "Concurrent gRPC and HTTP endpoint handlers with Go routines",
                    "Dockerized deployment setup with benchmark load tests"
                ],
                portfolio_impact="Demonstrates system-level concurrency control and low-latency network performance for Go engineering roles."
            )
            p2 = ProjectRecommendation(
                id="proj_2",
                title="Async Distributed Event Task Queue Engine",
                description="Offloads heavy background computations from core web services into isolated worker pools. Processes background queues reliably.",
                tech_stack=["Go", "Redis", "Docker", "Prometheus"],
                key_features=[
                    "Worker queue pool management with automatic retry logic",
                    "Structured JSON event serialization with dead-letter queue",
                    "Prometheus metrics scraping endpoint for queue throughput"
                ],
                portfolio_impact="Proves understanding of distributed queuing, worker synchronization, and system reliability."
            )
            p3 = ProjectRecommendation(
                id="proj_3",
                title="Cloud Infrastructure Log Aggregator API",
                description="Streams and indexes multi-tenant microservice logs for real-time security auditing. Handles high-throughput log streams.",
                tech_stack=["Go", "FastAPI", "JWT", "Docker"],
                key_features=[
                    "High-throughput log stream parser with regex pattern filters",
                    "JWT authentication middleware and role-based access control",
                    "Comprehensive automated test suite covering edge cases"
                ],
                portfolio_impact="Showcases production backend API design, authentication security, and unit testing practices."
            )
            return [p1, p2, p3]

        elif "react" in target_role.lower() or "frontend" in target_role.lower():
            p1 = ProjectRecommendation(
                id="proj_1",
                title="Enterprise Collaborative Workspace Dashboard",
                description="Enables distributed teams to manage real-time project state and interactive analytics. Built with optimistic UI state updates.",
                tech_stack=["React", "Next.js", "TypeScript", "Tailwind CSS", "Zustand"],
                key_features=[
                    "Dynamic drag-and-drop Kanban interface with optimistic UI updates",
                    "Real-time state management with custom React hooks & Zustand",
                    "Accessible WCAG 2.1 compliant UI design system with dark mode"
                ],
                portfolio_impact="Demonstrates advanced React state architecture, custom hooks, and polished frontend UI components."
            )
            p2 = ProjectRecommendation(
                id="proj_2",
                title="High-Performance Data Visualization Studio",
                description="Renders massive real-time financial time-series data without UI frame drops. Implements virtualized list rendering.",
                tech_stack=["React", "TypeScript", "Vitest", "Tailwind CSS"],
                key_features=[
                    "Virtualized list rendering for 10,000+ data points",
                    "Debounced search and multi-facet filtering engine",
                    "Comprehensive Vitest unit component test coverage"
                ],
                portfolio_impact="Proves frontend performance optimization, memory management, and automated UI testing capability."
            )
            p3 = ProjectRecommendation(
                id="proj_3",
                title="AI Prompt Design System & Portal",
                description="Streamlines prompt engineering workflows for generative AI applications. Includes variable token slot builders.",
                tech_stack=["Next.js", "React", "TypeScript", "Tailwind CSS"],
                key_features=[
                    "Modular template builder with dynamic variable token slots",
                    "OAuth 2.0 authentication flow with persistent session storage",
                    "Automated Lighthouse CI performance score > 95"
                ],
                portfolio_impact="Highlights modern Next.js App Router patterns, TypeScript type safety, and product aesthetics."
            )
            return [p1, p2, p3]

        else:
            # Default Python / Backend SDE
            p1 = ProjectRecommendation(
                id="proj_1",
                title="Distributed API Rate Limiter & Gateway",
                description="Prevents API abuse and token bucket exhaustion across multi-tenant microservices. Implements sliding window rate limiting with Redis.",
                tech_stack=["FastAPI", "Redis", "Docker", "PyTest", "PostgreSQL"],
                key_features=[
                    "Redis sliding window rate limiting middleware for FastAPI endpoints",
                    "Automated PyTest suite achieving 90%+ code coverage on edge cases",
                    "Docker-compose multi-container orchestration setup with health checks"
                ],
                portfolio_impact="Demonstrates production concurrency control, high-throughput caching, and containerized deployment skills."
            )
            p2 = ProjectRecommendation(
                id="proj_2",
                title="Async Background Task Worker Engine",
                description="Processes heavy background jobs asynchronously without blocking HTTP APIs. Uses Celery and Redis task queues.",
                tech_stack=["FastAPI", "Celery", "Redis", "SQLAlchemy", "Docker"],
                key_features=[
                    "Celery/Redis worker queue integration with dynamic progress polling",
                    "PostgreSQL transactional status updates with SQLAlchemy ORM",
                    "Automated CI/CD GitHub Actions workflow running tests on pull requests"
                ],
                portfolio_impact="Proves mastery of asynchronous system design, ORM database transactions, and automated CI/CD pipelines."
            )
            p3 = ProjectRecommendation(
                id="proj_3",
                title="Multi-Tenant Enterprise Audit Log Service",
                description="Captures immutable audit logs for regulatory compliance and security vulnerability tracing. Cryptographically hashes event records.",
                tech_stack=["FastAPI", "Pydantic", "PyTest", "PostgreSQL", "Docker"],
                key_features=[
                    "Cryptographically hashed event log stream storing immutable records",
                    "Role-based JWT token authentication with rate-limited access",
                    "Comprehensive OpenAPI/Swagger documentation with Pydantic validation"
                ],
                portfolio_impact="Showcases enterprise security standards, strict Pydantic data validation, and clear API architecture documentation."
            )
            return [p1, p2, p3]

    def _generate_rule_based_analysis(
        self,
        signals: Dict[str, Any],
        target_role: str,
        company_tier: str,
        sprint_duration_days: int
    ) -> AuditAnalyzeResponse:
        """Deterministic signal-driven fallback gap analysis with strict grounded scoring."""
        score = 68
        strengths = []
        gaps = []
        milestones = []

        has_tests = signals.get("has_unit_tests", False) or signals.get("has_tests", False)
        has_docker = signals.get("has_docker", False)
        has_readme = signals.get("has_readme", False)
        has_caching = signals.get("has_caching", False)
        detected_tech = signals.get("detected_technologies", [])

        # Filter detected tech to avoid implying unverified strengths
        grounded_tech = [
            t for t in detected_tech 
            if not (t == "docker" and not has_docker) 
            and not (t == "pytest" and not has_tests)
            and not (t == "redis" and not has_caching)
        ]

        # 1. Acknowledge proven tech & repos
        if signals.get("total_repos", 0) > 0:
            strengths.append(f"Active repository presence ({signals.get('total_repos')} repos)")
        
        if grounded_tech:
            strengths.append(f"Proven stack experience in {', '.join(grounded_tech[:5])}")

        # 2. Check README documentation
        if not has_readme:
            gaps.append(
                GapItem(
                    category="Documentation & Maintenance",
                    issue="Missing comprehensive README documentation for repository setup and architecture.",
                    severity="MEDIUM"
                )
            )
            score -= 5
        else:
            strengths.append("README documentation present")

        # 3. Check unit testing
        if not has_tests:
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

        # 4. Check Docker containerization
        if not has_docker:
            gaps.append(
                GapItem(
                    category="DevOps & Infrastructure",
                    issue="Missing Dockerfile / containerization configuration for reproducible environments.",
                    severity="MEDIUM"
                )
            )
            score -= 5
        else:
            strengths.append("Docker containerization setup present")

        # 5. Check caching / architecture for backend roles
        if "backend" in target_role.lower():
            if not has_caching:
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
            else:
                strengths.append("In-memory caching layer integrated")

        if not milestones:
            milestones.append(
                SprintMilestone(
                    step=1,
                    title="CI/CD GitHub Actions Pipeline",
                    description="Configure automated test execution and linting on pull requests.",
                    resource_url=format_resource_url("GitHub actions CI CD tutorial", "freecodecamp")
                )
            )

        final_score = max(45, min(95, score))
        grounded_strengths = filter_grounded_strengths(strengths, signals)
        projects = self._generate_default_projects(target_role)

        return AuditAnalyzeResponse(
            readiness_score=final_score,
            top_strengths=grounded_strengths,
            detected_gaps=gaps,
            recommended_sprint=RecommendedSprint(
                title=f"{target_role.replace('_', ' ').title()} Production Refactor Sprint",
                milestones=milestones
            ),
            recommended_projects=projects
        )


gemini_service = GeminiService()
