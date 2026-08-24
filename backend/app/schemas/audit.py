"""Pydantic schemas for GitHub repository audit and Gemini LLM gap analysis."""

from typing import List
from pydantic import BaseModel, Field


class AuditAnalyzeRequest(BaseModel):
    """Request payload for repository audit analysis."""
    
    github_token: str = Field(..., description="GitHub OAuth or Personal Access Token")
    target_role: str = Field(
        ...,
        description="Target job role (e.g., 'backend_go_sde1', 'backend_python_sde1', 'frontend_react_sde1')",
        example="backend_go_sde1"
    )
    company_tier: str = Field(
        "startup",
        description="Target company tier (e.g., 'startup', 'bigtech')",
        example="startup"
    )
    sprint_duration_days: int = Field(
        7,
        description="Sprint duration limit in days",
        ge=1,
        le=30,
        example=7
    )


class GapItem(BaseModel):
    """Individual gap item detected in candidate profile/repos."""
    
    category: str = Field(..., description="Category of the gap (e.g., Testing, Caching, CI/CD, Architecture)")
    issue: str = Field(..., description="Detailed description of the detected issue")
    severity: str = Field(..., description="Severity level: 'HIGH', 'MEDIUM', or 'LOW'")


class SprintMilestone(BaseModel):
    """Milestone step within recommended sprint plan."""
    
    step: int = Field(..., description="Sequential milestone step number")
    title: str = Field(..., description="Title of the milestone")
    description: str = Field(..., description="Detailed instructions for the milestone")
    resource_url: str = Field(..., description="Learning or reference URL for the milestone")


class RecommendedSprint(BaseModel):
    """Sprint plan recommended based on gap audit."""
    
    title: str = Field(..., description="Title of the sprint plan")
    milestones: List[SprintMilestone] = Field(default_factory=list, description="Ordered list of milestone steps")


class AuditAnalyzeResponse(BaseModel):
    """Response payload for repository audit analysis."""
    
    readiness_score: int = Field(..., description="Overall readiness score (0-100)", ge=0, le=100)
    top_strengths: List[str] = Field(default_factory=list, description="Key candidate code strengths")
    detected_gaps: List[GapItem] = Field(default_factory=list, description="Identified technical gaps")
    recommended_sprint: RecommendedSprint = Field(..., description="Tailored 48h to 7d sprint plan")
