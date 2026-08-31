/**
 * API Client library for SprintReady Backend.
 */

export interface AuditAnalyzeRequest {
  github_token: string;
  target_role: string;
  company_tier: string;
  sprint_duration_days: number;
}

export interface GapItem {
  category: string;
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface SprintMilestone {
  step: number;
  title: string;
  description: string;
  resource_url: string;
}

export interface RecommendedSprint {
  title: string;
  milestones: SprintMilestone[];
}

export interface ProjectRecommendation {
  id?: string;
  title: string;
  description?: string;
  problem_statement?: string;
  tech_stack: string[] | string;
  key_features: string[];
  portfolio_impact: string;
}

export interface AuditAnalyzeResponse {
  readiness_score: number;
  top_strengths: string[];
  detected_gaps: GapItem[];
  recommended_sprint: RecommendedSprint;
  recommended_projects?: ProjectRecommendation[];
}

export interface VerifyStepRequest {
  sprint_id: string;
  milestone_step: number;
  evidence_url: string;
}

export interface VerifyStepResponse {
  status: 'VERIFIED' | 'PENDING' | 'FAILED' | string;
  message: string;
  sprint_progress_pct: number;
  recalculated_score?: number;
  resolved_gap?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Trigger candidate repository audit and Gemini gap analysis.
 */
export async function analyzeAudit(
  payload: AuditAnalyzeRequest
): Promise<AuditAnalyzeResponse> {
  const url = `${API_BASE_URL}/api/v1/audit/analyze`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Audit request failed with status ${response.status}`
    );
  }

  const data = await response.json();
  console.log("Audit API Payload:", data);
  return data;
}

/**
 * Verify candidate proof-of-work PR milestone step submission.
 */
export async function verifySprintStep(
  payload: VerifyStepRequest
): Promise<VerifyStepResponse> {
  const url = `${API_BASE_URL}/api/v1/sprint/verify-step`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Step verification failed with status ${response.status}`
    );
  }

  return response.json();
}
