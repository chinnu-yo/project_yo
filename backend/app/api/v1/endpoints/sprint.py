"""FastAPI route handler for sprint milestone step verification."""

from fastapi import APIRouter, HTTPException, status
from app.schemas.sprint import VerifyStepRequest, VerifyStepResponse
from app.services.sprint_service import sprint_service

router = APIRouter()


@router.post(
    "/verify-step",
    response_model=VerifyStepResponse,
    status_code=status.HTTP_200_OK,
    summary="Validates candidate's proof-of-work submission for a milestone step",
    description="Inspects submitted GitHub PR evidence URL to confirm completion and update sprint progress."
)
async def verify_step(request: VerifyStepRequest) -> VerifyStepResponse:
    """Verify sprint milestone step submission."""
    try:
        response = await sprint_service.verify_milestone_step(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sprint verification error: {str(e)}"
        )
