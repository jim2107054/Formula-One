"""
Theory Generator

Generates structured learning materials (slides, notes, summaries)
grounded in uploaded course content with optional external context.
"""

from app.gemini_rag.service import get_gemini_service
from app.generation.tools.wiki import get_wiki_context


class TheoryGenerator:
    """
    Generates theory-based learning materials using uploaded documents
    as the primary source and Wikipedia for supplementary context.
    """

    def __init__(self):
        """Initialize the Theory Generator with shared GeminiService."""
        self.rag = get_gemini_service()

    async def generate_material(self, topic: str, material_type: str) -> dict:
        """
        Generate learning material for a given topic.

        Args:
            topic: The topic to generate material for.
            material_type: Type of material - 'slides', 'notes', or 'summary'.

        Returns:
            dict: Contains topic, type, and generated content.
                  {"topic": str, "type": str, "content": str}
        """
        # Get external context from Wikipedia
        wiki_summary = get_wiki_context(topic)

        # Build the base prompt
        prompt = self._build_prompt(topic, wiki_summary, material_type)

        # Generate response using Gemini with uploaded documents
        response_text = await self.rag.ask_question(prompt)

        return {
            "topic": topic,
            "type": material_type,
            "content": response_text
        }

    def _build_prompt(self, topic: str, wiki_summary: str, material_type: str) -> str:
        """
        Build the prompt for content generation.

        Args:
            topic: The user's topic.
            wiki_summary: External context from Wikipedia.
            material_type: The type of material to generate.

        Returns:
            str: The complete prompt string.
        """
        # Base prompt with topic and context
        base_prompt = f"""
You are an expert professor creating educational content.

**User's Topic:** {topic}

**External Context (for definitions only):**
{wiki_summary}

**IMPORTANT INSTRUCTIONS:**
- Use the uploaded documents as your PRIMARY source of information.
- Use the external context only for definitions or clarifications.
- If the topic is not covered in the uploaded documents, state that clearly.
- Be accurate and comprehensive in your explanations.
"""

        # Add format-specific instructions
        if material_type == "slides":
            format_instructions = """
**OUTPUT FORMAT:**
Generate content formatted as a JSON array of slide objects.
Each object should have:
- "title": A clear slide title
- "bullet_points": An array of 3-5 concise bullet points

Example format:
[
  {"title": "Introduction to Topic", "bullet_points": ["Point 1", "Point 2", "Point 3"]},
  {"title": "Key Concepts", "bullet_points": ["Concept A", "Concept B", "Concept C"]}
]

Output ONLY the JSON array, no additional text.
"""
        elif material_type == "notes":
            format_instructions = """
**OUTPUT FORMAT:**
Generate structured Markdown notes with:
- A main title (# heading)
- Section headers (## headings)
- Bullet points for key information
- Code examples if relevant (in code blocks)

Example format:
# Topic Title

## Overview
- Key point 1
- Key point 2

## Details
- Detailed explanation
- More information
"""
        elif material_type == "summary":
            format_instructions = """
**OUTPUT FORMAT:**
Generate a concise summary with:
- A brief overview paragraph (2-3 sentences)
- Key takeaways as bullet points (3-5 points)
- A conclusion sentence

Keep it brief but comprehensive.
"""
        else:
            format_instructions = """
**OUTPUT FORMAT:**
Generate clear, well-structured educational content about the topic.
"""

        return base_prompt + format_instructions

    async def generate_with_context(self, topic: str, context: str, material_type: str = "notes") -> dict:
        """
        Generate learning material using provided context from memory store.

        Args:
            topic: The topic to generate material for.
            context: Retrieved context from ChromaDB.
            material_type: Type of material - 'slides', 'notes', or 'summary'.

        Returns:
            dict: Contains topic, type, and generated content.
        """
        # Get external context from Wikipedia
        wiki_summary = get_wiki_context(topic)

        # Build prompt with memory context
        prompt = self._build_context_prompt(
            topic, context, wiki_summary, material_type)

        # Generate using chat_with_context (doesn't require uploaded files)
        response_text = await self.rag.chat_with_context(prompt, context)

        return {
            "topic": topic,
            "type": material_type,
            "content": response_text
        }

    def _build_context_prompt(self, topic: str, context: str, wiki_summary: str, material_type: str) -> str:
        """Build prompt for context-aware generation."""
        format_map = {
            "slides": "a JSON array of slide objects with 'title' and 'bullet_points'",
            "notes": "structured Markdown notes with headers and bullet points",
            "summary": "a concise summary with overview and key takeaways"
        }

        format_instruction = format_map.get(
            material_type, "clear educational content")

        return f"""Generate {format_instruction} about: {topic}

Use the provided context as your primary source.
Wikipedia reference (for definitions only): {wiki_summary}

Be comprehensive and educational."""
