"""Supabase Database Client Integration Service."""

import logging
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)


class DBService:
    """Service for handling Supabase PostgreSQL persistence."""

    def __init__(self):
        self.client = None
        self._init_supabase()

    def _init_supabase(self):
        """Safely initialize Supabase client if valid credentials exist."""
        if (
            settings.SUPABASE_URL 
            and settings.SUPABASE_KEY 
            and "your-supabase" not in settings.SUPABASE_URL
        ):
            try:
                from supabase import create_client
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Supabase client: {e}")
                self.client = None
        else:
            logger.info("Supabase credentials omitted or placeholder. Operating in in-memory mode.")

    async def upsert_user_profile(self, profile_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Persist or update candidate user profile in Supabase user_profiles table."""
        if not self.client:
            logger.debug(f"[Mock DB] upsert_user_profile: {profile_data}")
            return profile_data

        try:
            data = {
                "github_username": profile_data.get("github_username", "candidate"),
                "readiness_score": profile_data.get("readiness_score", 0),
                "target_role": profile_data.get("target_role", "backend_sde1"),
                "company_tier": profile_data.get("company_tier", "startup"),
                "updated_at": datetime.utcnow().isoformat(),
            }
            response = self.client.table("user_profiles").upsert(data).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error persisting user_profile to Supabase: {e}")
            return None

    async def save_sprint(self, sprint_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save a new recommended sprint roadmap into Supabase sprints table."""
        if not self.client:
            logger.debug(f"[Mock DB] save_sprint: {sprint_data}")
            return sprint_data

        try:
            data = {
                "sprint_id": sprint_data.get("sprint_id", "sp_12345"),
                "target_role": sprint_data.get("target_role", ""),
                "title": sprint_data.get("title", ""),
                "milestones": sprint_data.get("milestones", []),
                "status": "ACTIVE",
                "progress_pct": 0,
                "created_at": datetime.utcnow().isoformat(),
            }
            response = self.client.table("sprints").upsert(data).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error saving sprint to Supabase: {e}")
            return None

    async def update_sprint_step(
        self,
        sprint_id: str,
        milestone_step: int,
        evidence_url: str,
        status: str,
        progress_pct: int
    ) -> Optional[Dict[str, Any]]:
        """Update milestone step verification status and progress in Supabase."""
        if not self.client:
            logger.debug(
                f"[Mock DB] update_sprint_step: sprint_id={sprint_id}, step={milestone_step}, status={status}"
            )
            return {"sprint_id": sprint_id, "status": status, "progress_pct": progress_pct}

        try:
            data = {
                "last_verified_step": milestone_step,
                "last_evidence_url": evidence_url,
                "status": status,
                "progress_pct": progress_pct,
                "updated_at": datetime.utcnow().isoformat(),
            }
            response = (
                self.client.table("sprints")
                .update(data)
                .eq("sprint_id", sprint_id)
                .execute()
            )
            return response.data
        except Exception as e:
            logger.error(f"Error updating sprint step in Supabase: {e}")
            return None


db_service = DBService()
