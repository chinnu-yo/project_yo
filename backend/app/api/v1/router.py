"""API v1 Router aggregation."""

from fastapi import APIRouter
from app.api.v1.endpoints import audit, sprint

api_v1_router = APIRouter()

api_v1_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_v1_router.include_router(sprint.router, prefix="/sprint", tags=["Sprint"])
