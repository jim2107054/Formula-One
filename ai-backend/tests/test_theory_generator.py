"""
Tests for Theory Generator

Tests the TheoryGenerator class functionality with mocked GeminiService.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


class TestTheoryGenerator:
    """Tests for TheoryGenerator class."""

    @pytest.fixture
    def mock_gemini_service(self):
        """Create a mocked GeminiService."""
        mock_service = MagicMock()
        mock_service.ask_question = AsyncMock(return_value="Generated content")
        mock_service.uploaded_files = ["fake_file"]
        return mock_service

    @pytest.fixture
    def mock_wiki_context(self):
        """Create a mocked get_wiki_context."""
        with patch('app.generation.theory_generator.get_wiki_context') as mock:
            mock.return_value = "Wikipedia summary for the topic."
            yield mock

    @pytest.mark.asyncio
    async def test_generate_material_slides(self, mock_gemini_service, mock_wiki_context):
        """Test generating slides material."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            result = await generator.generate_material("Binary Search", "slides")

            assert result["topic"] == "Binary Search"
            assert result["type"] == "slides"
            assert result["content"] == "Generated content"
            mock_gemini_service.ask_question.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_material_notes(self, mock_gemini_service, mock_wiki_context):
        """Test generating notes material."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            result = await generator.generate_material("Sorting Algorithms", "notes")

            assert result["topic"] == "Sorting Algorithms"
            assert result["type"] == "notes"
            assert result["content"] == "Generated content"

    @pytest.mark.asyncio
    async def test_generate_material_summary(self, mock_gemini_service, mock_wiki_context):
        """Test generating summary material."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            result = await generator.generate_material("Data Structures", "summary")

            assert result["topic"] == "Data Structures"
            assert result["type"] == "summary"
            assert result["content"] == "Generated content"

    @pytest.mark.asyncio
    async def test_generate_material_calls_wiki_context(self, mock_gemini_service, mock_wiki_context):
        """Test that wiki context is fetched."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            await generator.generate_material("Hash Tables", "notes")

            mock_wiki_context.assert_called_once_with("Hash Tables")

    def test_build_prompt_slides(self, mock_gemini_service):
        """Test prompt building for slides format."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            prompt = generator._build_prompt(
                "Test Topic", "Wiki summary", "slides")

            assert "Test Topic" in prompt
            assert "Wiki summary" in prompt
            assert "JSON array" in prompt
            assert "bullet_points" in prompt

    def test_build_prompt_notes(self, mock_gemini_service):
        """Test prompt building for notes format."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            prompt = generator._build_prompt(
                "Test Topic", "Wiki summary", "notes")

            assert "Test Topic" in prompt
            assert "Markdown" in prompt

    def test_build_prompt_summary(self, mock_gemini_service):
        """Test prompt building for summary format."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            prompt = generator._build_prompt(
                "Test Topic", "Wiki summary", "summary")

            assert "Test Topic" in prompt
            assert "concise summary" in prompt

    def test_build_prompt_unknown_type(self, mock_gemini_service):
        """Test prompt building for unknown material type."""
        with patch('app.generation.theory_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.theory_generator import TheoryGenerator
            generator = TheoryGenerator()

            prompt = generator._build_prompt(
                "Test Topic", "Wiki summary", "unknown")

            assert "Test Topic" in prompt
            assert "well-structured educational content" in prompt
