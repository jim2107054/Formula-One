"""
Health router for AI Backend service
Provides health check and readiness endpoints
"""
from fastapi import APIRouter, status
from pydantic import BaseModel
from datetime import datetime
import sys


router = APIRouter(prefix="/health", tags=["Health"])


class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    message: str
    timestamp: datetime
    version: str
    python_version: str


class ReadinessResponse(BaseModel):
    """Readiness check response model"""
    ready: bool
    message: str
    timestamp: datetime


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Check if the AI backend service is running"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint
    Returns basic service information and status
    """
    return HealthResponse(
        status="healthy",
        message="AI Backend service is running",
        timestamp=datetime.utcnow(),
        version="0.1.0",
        python_version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness Check",
    description="Check if the AI backend service is ready to accept requests"
)
async def readiness_check() -> ReadinessResponse:
    """
    Readiness check endpoint
    Returns whether the service is ready to handle requests
    """
    # For now, always ready. In production, check DB connections, etc.
    return ReadinessResponse(
        ready=True,
        message="Service is ready to accept requests",
        timestamp=datetime.utcnow()
    )
