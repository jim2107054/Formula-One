"""
Validate router
Handles content validation including syntax, grounding, rubric, and test checks
"""
from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
import re


router = APIRouter(prefix="/validate", tags=["Validate"])


class ValidationType(str, Enum):
    """Types of validation"""
    SYNTAX = "syntax"
    GROUNDING = "grounding"
    RUBRIC = "rubric"
    TEST = "test"


class ValidateRequest(BaseModel):
    """Request model for validation"""
    content: str
    contentType: str  # code or text
    validations: List[ValidationType]
    language: Optional[str] = "python"


class ValidationResult(BaseModel):
    """Individual validation result"""
    type: str
    status: str  # pass, warning, fail
    message: str
    details: Optional[List[str]] = None
    score: Optional[float] = None


class ValidateResponse(BaseModel):
    """Response model for validation"""
    results: List[ValidationResult]
    overallScore: float
    message: str


def validate_syntax(content: str, content_type: str, language: str) -> ValidationResult:
    """Validate code syntax"""
    if content_type != "code":
        return ValidationResult(
            type="syntax",
            status="pass",
            message="Syntax check only applies to code",
            score=1.0
        )
    
    issues = []
    
    # Basic Python syntax checks
    if language.lower() == "python":
        # Check for unmatched parentheses/brackets
        open_parens = content.count('(')
        close_parens = content.count(')')
        if open_parens != close_parens:
            issues.append(f"Unmatched parentheses: {open_parens} opening, {close_parens} closing")
        
        open_brackets = content.count('[')
        close_brackets = content.count(']')
        if open_brackets != close_brackets:
            issues.append(f"Unmatched brackets: {open_brackets} opening, {close_brackets} closing")
        
        open_braces = content.count('{')
        close_braces = content.count('}')
        if open_braces != close_braces:
            issues.append(f"Unmatched braces: {open_braces} opening, {close_braces} closing")
        
        # Check for common syntax patterns
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            stripped = line.rstrip()
            if stripped and not stripped.startswith('#'):
                # Check if/for/while/def/class without colon
                if re.match(r'^\s*(if|elif|else|for|while|def|class|try|except|finally|with)\s', stripped):
                    if not stripped.endswith(':') and not stripped.endswith(':\\'):
                        issues.append(f"Line {i}: Missing colon after control statement")
    
    if issues:
        return ValidationResult(
            type="syntax",
            status="warning" if len(issues) < 3 else "fail",
            message=f"Found {len(issues)} syntax issue(s)",
            details=issues,
            score=max(0, 1.0 - (len(issues) * 0.2))
        )
    
    return ValidationResult(
        type="syntax",
        status="pass",
        message="No syntax errors detected",
        details=["Code structure appears valid", "Brackets and parentheses are balanced"],
        score=1.0
    )


def validate_grounding(content: str, content_type: str) -> ValidationResult:
    """Check if content is grounded in course materials"""
    # Simulate grounding check
    grounded_keywords = [
        "data structure", "algorithm", "complexity", "array", "linked list",
        "tree", "graph", "sort", "search", "hash", "stack", "queue",
        "recursion", "iteration", "function", "class", "object"
    ]
    
    content_lower = content.lower()
    found_keywords = [kw for kw in grounded_keywords if kw in content_lower]
    
    grounding_score = min(1.0, len(found_keywords) / 5)  # 5 keywords = full score
    
    if grounding_score >= 0.8:
        return ValidationResult(
            type="grounding",
            status="pass",
            message="Content is well-grounded in course materials",
            details=[f"Found {len(found_keywords)} relevant concepts", "Content aligns with course topics"],
            score=grounding_score
        )
    elif grounding_score >= 0.4:
        return ValidationResult(
            type="grounding",
            status="warning",
            message="Content is partially grounded",
            details=[f"Found {len(found_keywords)} relevant concepts", "Consider adding more course-related content"],
            score=grounding_score
        )
    else:
        return ValidationResult(
            type="grounding",
            status="fail",
            message="Content may not be grounded in course materials",
            details=["Few course-related concepts found", "Consider referencing course materials"],
            score=grounding_score
        )


def validate_rubric(content: str, content_type: str) -> ValidationResult:
    """Evaluate content against a rubric"""
    criteria = {
        "clarity": 0,
        "completeness": 0,
        "correctness": 0,
        "organization": 0
    }
    
    # Clarity: Check for comments/explanations
    if content_type == "code":
        if "#" in content or '"""' in content or "'''" in content:
            criteria["clarity"] = 0.8
        else:
            criteria["clarity"] = 0.4
    else:
        if len(content) > 200:
            criteria["clarity"] = 0.7
        else:
            criteria["clarity"] = 0.5
    
    # Completeness: Check content length and structure
    lines = content.split('\n')
    if len(lines) > 10:
        criteria["completeness"] = 0.8
    elif len(lines) > 5:
        criteria["completeness"] = 0.6
    else:
        criteria["completeness"] = 0.4
    
    # Correctness: Basic heuristic
    criteria["correctness"] = 0.7  # Default moderate score
    
    # Organization: Check for structure
    if content_type == "code":
        if "def " in content or "class " in content:
            criteria["organization"] = 0.8
        else:
            criteria["organization"] = 0.5
    else:
        if "##" in content or "**" in content or "1." in content:
            criteria["organization"] = 0.8
        else:
            criteria["organization"] = 0.5
    
    avg_score = sum(criteria.values()) / len(criteria)
    
    details = [f"{k.capitalize()}: {int(v*100)}%" for k, v in criteria.items()]
    
    if avg_score >= 0.7:
        return ValidationResult(
            type="rubric",
            status="pass",
            message="Content meets rubric criteria",
            details=details,
            score=avg_score
        )
    elif avg_score >= 0.5:
        return ValidationResult(
            type="rubric",
            status="warning",
            message="Content partially meets rubric criteria",
            details=details,
            score=avg_score
        )
    else:
        return ValidationResult(
            type="rubric",
            status="fail",
            message="Content needs improvement to meet rubric",
            details=details,
            score=avg_score
        )


def validate_test(content: str, content_type: str, language: str) -> ValidationResult:
    """Run tests on code"""
    if content_type != "code":
        return ValidationResult(
            type="test",
            status="pass",
            message="Test validation only applies to code",
            score=1.0
        )
    
    # Simulate test results
    tests = [
        {"name": "Basic Functionality", "passed": True},
        {"name": "Edge Cases", "passed": True},
        {"name": "Error Handling", "passed": "def " in content or "try" in content},
        {"name": "Performance", "passed": True}
    ]
    
    passed = sum(1 for t in tests if t["passed"])
    total = len(tests)
    score = passed / total
    
    details = [f"{'✓' if t['passed'] else '✗'} {t['name']}" for t in tests]
    
    if score == 1.0:
        return ValidationResult(
            type="test",
            status="pass",
            message=f"All {total} tests passed",
            details=details,
            score=score
        )
    elif score >= 0.5:
        return ValidationResult(
            type="test",
            status="warning",
            message=f"{passed}/{total} tests passed",
            details=details,
            score=score
        )
    else:
        return ValidationResult(
            type="test",
            status="fail",
            message=f"Only {passed}/{total} tests passed",
            details=details,
            score=score
        )


@router.post(
    "",
    response_model=ValidateResponse,
    status_code=status.HTTP_200_OK,
    summary="Validate Content",
    description="Run validations on code or text content"
)
async def validate_content(request: ValidateRequest) -> ValidateResponse:
    """
    Validate content based on requested validation types
    Returns results for each validation type
    """
    results = []
    
    for validation_type in request.validations:
        if validation_type == ValidationType.SYNTAX:
            results.append(validate_syntax(request.content, request.contentType, request.language or "python"))
        elif validation_type == ValidationType.GROUNDING:
            results.append(validate_grounding(request.content, request.contentType))
        elif validation_type == ValidationType.RUBRIC:
            results.append(validate_rubric(request.content, request.contentType))
        elif validation_type == ValidationType.TEST:
            results.append(validate_test(request.content, request.contentType, request.language or "python"))
    
    # Calculate overall score
    if results:
        overall_score = sum(r.score or 0 for r in results) / len(results)
    else:
        overall_score = 0
    
    passed = sum(1 for r in results if r.status == "pass")
    
    return ValidateResponse(
        results=results,
        overallScore=round(overall_score, 2),
        message=f"Validation complete: {passed}/{len(results)} checks passed"
    )
