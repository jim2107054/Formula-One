"""
Generation Router

Handles content generation endpoints (theory, lab code).
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def generation_root():
    """
    Generation router root endpoint.

    Returns:
        dict: Generation service information
    """
    return {
        "service": "generation",
        "description": "Content generation endpoints for theory and lab code",
        "status": "ready"
    }


# Placeholder for future generation endpoints:
# - Theory content generation
# - Lab code generation
# - Tool-controlled generation
