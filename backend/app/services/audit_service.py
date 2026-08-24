"""Audit orchestration service combining GitHub harvesting, Gemini LLM gap analysis, and Supabase DB persistence."""

import logging
from app.schemas.audit import AuditAnalyzeRequest, AuditAnalyzeResponse
from app.services.github_service import github_service
from app.services.gemini_service import gemini_service
from app.services.db_service import db_service

logger = logging.getLogger(__name__)


class AuditService:
    """Service to orchestrate the repository audit workflow."""

    async def analyze_candidate_profile(
        self, request: AuditAnalyzeRequest
    ) -> AuditAnalyzeResponse:
        """Execute end-to-end audit analysis workflow for candidate."""
        logger.info(
            f"Starting audit analysis for target_role='{request.target_role}', "
            f"tier='{request.company_tier}', duration={request.sprint_duration_days}d"
        )

        # 1. Fetch user repositories via GitHub API
        repos = await github_service.fetch_user_repositories(request.github_token)

        # 2. Harvest code architecture and testing signals
        signals = await github_service.harvest_repo_signals(request.github_token, repos)

        # 3. Perform gap analysis via Gemini LLM (or rule engine fallback)
        audit_response = await gemini_service.analyze_gaps(
            signals=signals,
            target_role=request.target_role,
            company_tier=request.company_tier,
            sprint_duration_days=request.sprint_duration_days
        )

        # 4. Persist user profile and assigned sprint in Supabase DB
        await db_service.upsert_user_profile({
            "github_username": "candidate",
            "readiness_score": audit_response.readiness_score,
            "target_role": request.target_role,
            "company_tier": request.company_tier,
        })

        await db_service.save_sprint({
            "sprint_id": "sp_12345",
            "target_role": request.target_role,
            "title": audit_response.recommended_sprint.title,
            "milestones": [m.model_dump() for m in audit_response.recommended_sprint.milestones],
        })

        return audit_response


audit_service = AuditService()
