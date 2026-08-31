"""Sprint execution and proof-of-work verification service."""

import logging
from app.schemas.sprint import VerifyStepRequest, VerifyStepResponse
from app.services.github_service import github_service
from app.services.db_service import db_service

logger = logging.getLogger(__name__)


class SprintService:
    """Service to handle sprint step progress and PR submission verification."""

    async def verify_milestone_step(
        self, request: VerifyStepRequest
    ) -> VerifyStepResponse:
        """Verify candidate's milestone step submission via GitHub PR inspection."""
        logger.info(
            f"Verifying step {request.milestone_step} for sprint '{request.sprint_id}' "
            f"with evidence: {request.evidence_url}"
        )

        # Inspect PR state via GitHub Service
        pr_verification = await github_service.verify_pull_request(
            token="",
            evidence_url=request.evidence_url
        )

        if pr_verification.get("valid", False):
            total_steps = max(2, request.milestone_step)
            progress_pct = int((request.milestone_step / total_steps) * 100)
            status_str = "VERIFIED"

            # Determine resolved gap category and calculate score boost
            step_num = request.milestone_step
            if step_num == 1:
                resolved_gap = "Testing Practices"
                score_boost = 10
            elif step_num == 2:
                resolved_gap = "Caching & Architecture"
                score_boost = 8
            else:
                resolved_gap = "DevOps & Infrastructure"
                score_boost = 5

            recalculated_score = min(98, 65 + (step_num * score_boost))
            message_str = f"PR verified successfully! {resolved_gap} resolved. Recalibrated score: {recalculated_score}."

            # Update database record in Supabase
            await db_service.update_sprint_step(
                sprint_id=request.sprint_id,
                milestone_step=request.milestone_step,
                evidence_url=request.evidence_url,
                status=status_str,
                progress_pct=min(100, progress_pct)
            )

            return VerifyStepResponse(
                status=status_str,
                message=message_str,
                sprint_progress_pct=min(100, progress_pct),
                recalculated_score=recalculated_score,
                resolved_gap=resolved_gap
            )
        else:
            err_msg = pr_verification.get("error") or "Invalid or non-existent GitHub Pull Request URL."
            return VerifyStepResponse(
                status="FAILED",
                message=err_msg,
                sprint_progress_pct=0
            )


sprint_service = SprintService()
