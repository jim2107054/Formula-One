"""
Intent Router

Classifies user queries into theory, lab, or chat intents
and extracts relevant topic and format information.
"""

import json
from app.gemini_rag.service import get_gemini_service


class IntentRouter:
    """
    Classifies user intent and extracts structured information
    from natural language queries.
    """

    def __init__(self):
        """Initialize the Intent Router with shared GeminiService."""
        self.ai = get_gemini_service()

    async def classify_request(self, query: str) -> dict:
        """
        Classify a user query into an intent type with extracted metadata.

        Args:
            query: The user's natural language query.

        Returns:
            dict: Classification result with type, topic, and format.
                  {
                      "type": "theory" | "lab" | "chat",
                      "topic": "extracted topic",
                      "format": "slides" | "notes" | "code" | "text"
                  }
        """
        prompt = self._build_classification_prompt(query)

        try:
            # Use the AI to classify the query (no files needed)
            response = await self.ai.generate_without_files(prompt)

            # Parse the JSON response
            result = self._parse_response(response)
            return result

        except Exception as e:
            # Default to chat on any error
            return {
                "type": "chat",
                "topic": query,
                "format": "text",
                "error": str(e)
            }

    def _build_classification_prompt(self, query: str) -> str:
        """Build the classification prompt."""
        return f"""Analyze the following user query and classify it.

USER QUERY: "{query}"

Classify the query into ONE of these types:
- "theory": User is asking for slides, notes, summaries, explanations, or conceptual understanding.
- "lab": User is asking for code, lab exercises, programming solutions, debugging help, or implementation.
- "chat": General questions, follow-ups, or conversational queries.

Also extract:
- "topic": The core subject/topic being asked about (e.g., "Binary Search", "Sorting Algorithms", "Python functions")
- "format": The desired output format:
  - "slides" for presentation slides
  - "notes" for study notes
  - "summary" for brief summaries
  - "code" for programming code
  - "text" for general text response

Return ONLY valid JSON with no additional text or markdown:
{{"type": "theory", "topic": "extracted topic", "format": "notes"}}

Example outputs:
- "Explain binary search with slides" -> {{"type": "theory", "topic": "Binary Search", "format": "slides"}}
- "Write Python code for bubble sort" -> {{"type": "lab", "topic": "Bubble Sort", "format": "code"}}
- "What did we discuss last time?" -> {{"type": "chat", "topic": "previous discussion", "format": "text"}}

Now classify the query and return ONLY the JSON:"""

    def _parse_response(self, response: str) -> dict:
        """Parse the AI response into a structured dict."""
        # Clean the response (remove markdown code blocks if present)
        cleaned = response.strip()
        if cleaned.startswith("```"):
            # Remove markdown code block
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1] if lines[-1]
                                == "```" else lines[1:])

        # Try to find JSON in the response
        try:
            # Try direct parse
            result = json.loads(cleaned)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{[^{}]*\}', response)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Default fallback
                result = {
                    "type": "chat",
                    "topic": "unknown",
                    "format": "text"
                }

        # Validate and normalize
        valid_types = ["theory", "lab", "chat"]
        valid_formats = ["slides", "notes", "summary", "code", "text"]

        if result.get("type") not in valid_types:
            result["type"] = "chat"
        if result.get("format") not in valid_formats:
            result["format"] = "text"
        if not result.get("topic"):
            result["topic"] = "general"

        return result
