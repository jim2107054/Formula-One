"""
Validation API Router

Provides endpoints for code validation and AI-powered code review.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.validation.code_validator import CodeValidator


router = APIRouter()

# Lazy initialization
_validator: Optional[CodeValidator] = None


def get_validator() -> CodeValidator:
    """Get or create CodeValidator instance."""
    global _validator
    if _validator is None:
        _validator = CodeValidator()
    return _validator


# Request/Response Models
class ValidationRequest(BaseModel):
    """Request model for code validation."""
    code: str = Field(..., description="Python code to validate")
    problem_context: Optional[str] = Field(
        None, description="Optional problem statement or context for the code"
    )


class SyntaxResult(BaseModel):
    """Result of syntax check."""
    valid: bool
    error: Optional[str] = None


class ReviewResult(BaseModel):
    """Result of AI code review."""
    score: int = Field(..., ge=0, le=100)
    issues: list = []
    suggestions: list = []


class ValidationResponse(BaseModel):
    """Combined validation response."""
    syntax: SyntaxResult
    review: Optional[ReviewResult] = None


# Endpoints
@router.get("/")
async def validation_root():
    """Validation service information."""
    return {
        "service": "code-validator",
        "description": "Syntax checking and AI-powered code review",
        "endpoints": {
            "POST /validation/code": "Validate Python code"
        },
        "status": "ready"
    }


@router.post("/validation/code", response_model=ValidationResponse)
async def validate_code(request: ValidationRequest):
    """
    Validate Python code with syntax checking and AI review.

    1. Checks for Python syntax errors
    2. If syntax is valid, performs AI-powered code review

    Returns combined results with syntax status and review feedback.
    """
    validator = get_validator()

    try:
        # Step 1: Check syntax
        syntax_result = validator.check_syntax(request.code)

        # Step 2: If syntax is valid, perform AI review
        review_result = None
        if syntax_result["valid"]:
            review_result = await validator.ai_review(
                request.code,
                request.problem_context
            )

        return ValidationResponse(
            syntax=SyntaxResult(**syntax_result),
            review=ReviewResult(**review_result) if review_result else None
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Validation error: {str(e)}"
        )
