"""Pydantic schemas for sprint milestone step verification."""

from pydantic import BaseModel, Field, HttpUrl


class VerifyStepRequest(BaseModel):
    """Request payload for sprint step verification."""
    
    sprint_id: str = Field(..., description="ID of the active sprint", example="sp_12345")
    milestone_step: int = Field(..., description="Milestone step number to verify", ge=1, example=1)
    evidence_url: str = Field(
        ...,
        description="URL pointing to GitHub Pull Request or proof of work",
        example="https://github.com/username/repo/pull/4"
    )


from typing import Optional

class VerifyStepResponse(BaseModel):
    """Response payload for sprint step verification."""
    
    status: str = Field(..., description="Verification status: 'VERIFIED', 'PENDING', or 'FAILED'")
    message: str = Field(..., description="Detailed verification result message")
    sprint_progress_pct: int = Field(..., description="Updated sprint completion percentage", ge=0, le=100)
    recalculated_score: Optional[int] = Field(None, description="Updated readiness index score after gap resolution")
    resolved_gap: Optional[str] = Field(None, description="Category of the gap resolved by this step")
