"""
Tests for Lab Code Generator

Tests the LabGenerator class functionality with mocked GeminiService.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


class TestLabGenerator:
    """Tests for LabGenerator class."""

    @pytest.fixture
    def mock_gemini_service(self):
        """Create a mocked GeminiService."""
        mock_service = MagicMock()
        mock_service.ask_question = AsyncMock(
            return_value='{"problem_statement": "Test", "starter_code": "", "solution_code": "", "explanation": ""}'
        )
        mock_service.uploaded_files = ["fake_file"]
        return mock_service

    @pytest.mark.asyncio
    async def test_generate_lab_default_language(self, mock_gemini_service):
        """Test generating lab with default python language."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            result = await generator.generate_lab("Binary Search")

            assert result["topic"] == "Binary Search"
            assert result["language"] == "python"
            assert "lab_content" in result
            mock_gemini_service.ask_question.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_lab_custom_language(self, mock_gemini_service):
        """Test generating lab with custom language."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            result = await generator.generate_lab("Linked List", language="java")

            assert result["topic"] == "Linked List"
            assert result["language"] == "java"
            assert "lab_content" in result

    @pytest.mark.asyncio
    async def test_generate_lab_returns_response(self, mock_gemini_service):
        """Test that lab content contains the response."""
        expected_content = '{"problem_statement": "Implement sorting"}'
        mock_gemini_service.ask_question = AsyncMock(
            return_value=expected_content)

        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            result = await generator.generate_lab("Sorting")

            assert result["lab_content"] == expected_content

    def test_build_prompt_contains_topic(self, mock_gemini_service):
        """Test that prompt contains the topic."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            prompt = generator._build_prompt("Graph Traversal", "python")

            assert "Graph Traversal" in prompt

    def test_build_prompt_contains_language(self, mock_gemini_service):
        """Test that prompt contains the language."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            prompt = generator._build_prompt("Graph Traversal", "javascript")

            assert "javascript" in prompt

    def test_build_prompt_requires_json_output(self, mock_gemini_service):
        """Test that prompt requires JSON output format."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            prompt = generator._build_prompt("Arrays", "python")

            assert "JSON" in prompt
            assert "problem_statement" in prompt
            assert "starter_code" in prompt
            assert "solution_code" in prompt
            assert "explanation" in prompt

    def test_build_prompt_requires_correct_code(self, mock_gemini_service):
        """Test that prompt requires syntactically correct code."""
        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            prompt = generator._build_prompt("Recursion", "python")

            assert "syntactically correct" in prompt

    @pytest.mark.asyncio
    async def test_generate_lab_different_topics(self, mock_gemini_service):
        """Test generating labs for different topics."""
        topics = ["Stack", "Queue", "Tree", "Heap"]

        with patch('app.generation.lab_code_generator.get_gemini_service', return_value=mock_gemini_service):
            from app.generation.lab_code_generator import LabGenerator
            generator = LabGenerator()

            for topic in topics:
                result = await generator.generate_lab(topic)
                assert result["topic"] == topic
