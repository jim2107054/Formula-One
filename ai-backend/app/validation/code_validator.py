"""
Code Validator

Provides syntax checking and AI-powered code review functionality.
"""

import ast
import sys
import json
import re
from typing import Optional

from app.gemini_rag.service import GeminiService


class CodeValidator:
    """
    Validates code for syntax errors and provides AI-powered code review.
    """

    def __init__(self):
        """Initialize the CodeValidator with GeminiService."""
        self.ai = GeminiService()

    def check_syntax(self, code: str) -> dict:
        """
        Check Python code for syntax errors.

        Args:
            code: Python code string to validate.

        Returns:
            dict: {"valid": bool, "error": str or None}
        """
        try:
            ast.parse(code)
            return {"valid": True, "error": None}
        except (SyntaxError, IndentationError) as e:
            return {"valid": False, "error": str(e)}

    async def ai_review(self, code: str, problem_statement: Optional[str] = None) -> dict:
        """
        Perform AI-powered code review.

        Args:
            code: Python code string to review.
            problem_statement: Optional context about what the code should do.

        Returns:
            dict: {"score": int, "issues": list, "suggestions": list}
        """
        context = ""
        if problem_statement:
            context = f"\nPROBLEM CONTEXT:\n{problem_statement}\n"

        prompt = f"""You are a Senior Code Reviewer. Review this Python code.
{context}
CODE TO REVIEW:
```python
{code}
```

Check for:
1. Logic errors
2. Security vulnerabilities  
3. Code style issues
4. Best practices violations
5. Potential bugs

Return ONLY a valid JSON object with these exact keys:
- "score": integer from 0-100 (100 being perfect code)
- "issues": array of strings describing problems found
- "suggestions": array of strings with improvement recommendations

Example format:
{{"score": 85, "issues": ["Missing input validation"], "suggestions": ["Add type hints"]}}

JSON Response:"""

        try:
            response = await self.ai.generate_without_files(prompt)

            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
                # Validate expected keys
                return {
                    "score": result.get("score", 0),
                    "issues": result.get("issues", []),
                    "suggestions": result.get("suggestions", [])
                }
            else:
                return {
                    "score": 0,
                    "issues": ["Failed to parse AI response"],
                    "suggestions": []
                }

        except json.JSONDecodeError:
            return {
                "score": 0,
                "issues": ["Failed to parse AI response as JSON"],
                "suggestions": []
            }
        except Exception as e:
            return {
                "score": 0,
                "issues": [f"AI review failed: {str(e)}"],
                "suggestions": []
            }
