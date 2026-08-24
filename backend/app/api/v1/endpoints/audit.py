"""FastAPI route handler for repository audit gap analysis."""

from fastapi import APIRouter, HTTPException, status
from app.schemas.audit import AuditAnalyzeRequest, AuditAnalyzeResponse
from app.services.audit_service import audit_service

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AuditAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Scans candidate GitHub repos and generates Gap Analysis Report & Sprint Plan",
    description="Harvests GitHub signals and executes Gemini LLM gap analysis comparing profile against target job role."
)
async def analyze_audit(request: AuditAnalyzeRequest) -> AuditAnalyzeResponse:
    """Execute repository audit analysis."""
    try:
        response = await audit_service.analyze_candidate_profile(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audit analysis error: {str(e)}"
        )
