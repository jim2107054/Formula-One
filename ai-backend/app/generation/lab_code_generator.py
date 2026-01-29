"""
Lab Code Generator

Generates university-level lab exercises with problem statements,
starter code, solution code, and explanations.
"""

from app.gemini_rag.service import get_gemini_service


class LabGenerator:
    """
    Generates lab exercises using uploaded course documents
    to match the appropriate difficulty level.
    """

    def __init__(self):
        """Initialize the Lab Generator with shared GeminiService."""
        self.rag = get_gemini_service()

    async def generate_lab(self, topic: str, language: str = "python") -> dict:
        """
        Generate a lab exercise for a given topic.

        Args:
            topic: The topic for the lab exercise.
            language: Programming language for the code (default: python).

        Returns:
            dict: Contains topic, language, and generated lab content.
                  {"topic": str, "language": str, "lab_content": str}
        """
        # Build the prompt
        prompt = self._build_prompt(topic, language)

        # Generate response using Gemini with uploaded documents
        response_text = await self.rag.ask_question(prompt)

        return {
            "topic": topic,
            "language": language,
            "lab_content": response_text
        }

    def _build_prompt(self, topic: str, language: str) -> str:
        """
        Build the prompt for lab generation.

        Args:
            topic: The lab topic.
            language: The programming language.

        Returns:
            str: The complete prompt string.
        """
        prompt = f"""
You are an expert university-level coding tutor creating lab exercises.

**Lab Topic:** {topic}
**Programming Language:** {language}

**INSTRUCTIONS:**
- Create a university-level lab exercise for {topic} in {language}.
- Use the uploaded documents to match the course difficulty level.
- Ensure the code is syntactically correct and includes helpful comments.
- The exercise should be educational and build understanding progressively.

**OUTPUT FORMAT:**
You must output valid JSON with the following structure:
{{
  "problem_statement": "A clear description of the problem to solve, including any constraints or requirements.",
  "starter_code": "The skeleton code that students will start with. Include TODO comments where students need to fill in.",
  "solution_code": "The complete, working solution with detailed inline comments explaining each step.",
  "explanation": "A step-by-step explanation of the solution, including the algorithm used and its time/space complexity."
}}

**IMPORTANT:**
- Output ONLY the JSON object, no additional text or markdown code blocks.
- All code must be syntactically correct for {language}.
- Include meaningful variable names and comments.
- The starter code should have clear TODO markers for students.
"""
        return prompt

    async def generate_with_context(self, topic: str, context: str, language: str = "python") -> dict:
        """
        Generate a lab exercise using provided context from memory store.

        Args:
            topic: The topic for the lab exercise.
            context: Retrieved context from ChromaDB.
            language: Programming language for the code.

        Returns:
            dict: Contains topic, language, and generated lab content.
        """
        prompt = f"""Create a university-level lab exercise for {topic} in {language}.

Use the following course context to match the appropriate difficulty level:
{context}

Output valid JSON with keys: problem_statement, starter_code, solution_code, explanation.
Ensure code is syntactically correct with helpful comments."""

        # Generate using chat_with_context
        response_text = await self.rag.chat_with_context(prompt, context)

        return {
            "topic": topic,
            "language": language,
            "lab_content": response_text
        }
