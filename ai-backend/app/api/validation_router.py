"""
Validation Router

Handles validation endpoints for AI-generated content.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def validation_root():
    """
    Validation router root endpoint.

    Returns:
        dict: Validation service information
    """
    return {
        "service": "validation",
        "description": "Validation endpoints for code, grounding, and rubric checks",
        "status": "ready"
    }


# Placeholder for future validation endpoints:
# - Code syntax validation
# - Grounding validation
# - Rubric-based evaluation
