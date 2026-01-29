"""
Generation Router

Handles content generation endpoints (theory, lab code).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.generation.theory_generator import TheoryGenerator
from app.generation.lab_code_generator import LabGenerator


router = APIRouter()


# Pydantic request models
class TheoryRequest(BaseModel):
    """Request model for theory generation."""
    topic: str = Field(..., description="The topic to generate material for")
    type: str = Field(
        default="notes",
        description="Type of material: 'slides', 'notes', or 'summary'"
    )


class LabRequest(BaseModel):
    """Request model for lab generation."""
    topic: str = Field(..., description="The topic for the lab exercise")
    language: str = Field(
        default="python",
        description="Programming language for the code"
    )


# Lazy initialization to avoid API key requirement at import time
_theory_generator = None
_lab_generator = None


def get_theory_generator() -> TheoryGenerator:
    """Get or create TheoryGenerator instance."""
    global _theory_generator
    if _theory_generator is None:
        _theory_generator = TheoryGenerator()
    return _theory_generator


def get_lab_generator() -> LabGenerator:
    """Get or create LabGenerator instance."""
    global _lab_generator
    if _lab_generator is None:
        _lab_generator = LabGenerator()
    return _lab_generator


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


@router.post("/theory")
async def generate_theory(request: TheoryRequest):
    """
    Generate theory-based learning materials.

    - **topic**: The subject topic to generate content for
    - **type**: Format of output - 'slides' (JSON), 'notes' (Markdown), or 'summary'

    Returns generated content based on uploaded documents and external context.
    """
    try:
        generator = get_theory_generator()
        result = await generator.generate_material(
            topic=request.topic,
            material_type=request.type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate theory: {str(e)}")


@router.post("/lab")
async def generate_lab(request: LabRequest):
    """
    Generate lab exercises with code.

    - **topic**: The topic for the lab exercise
    - **language**: Programming language (default: python)

    Returns JSON with problem_statement, starter_code, solution_code, and explanation.
    """
    try:
        generator = get_lab_generator()
        result = await generator.generate_lab(
            topic=request.topic,
            language=request.language
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate lab: {str(e)}")
