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
            message_str = f"PR verified successfully. Milestone {request.milestone_step} complete."

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
                sprint_progress_pct=min(100, progress_pct)
            )
        else:
            return VerifyStepResponse(
                status="FAILED",
                message="Unable to verify PR submission. Please ensure PR is open or merged.",
                sprint_progress_pct=0
            )


sprint_service = SprintService()
