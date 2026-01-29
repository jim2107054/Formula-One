"""
Tests for Intent Router

Tests the IntentRouter class for query classification.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


class TestIntentRouter:
    """Tests for IntentRouter class."""

    @pytest.fixture
    def mock_gemini_service(self):
        """Create a mocked GeminiService."""
        mock_service = MagicMock()
        mock_service.generate_without_files = AsyncMock(
            return_value='{"type": "theory", "topic": "Binary Search", "format": "slides"}'
        )
        return mock_service

    @pytest.mark.asyncio
    async def test_classify_theory_request(self, mock_gemini_service):
        """Test classifying a theory request."""
        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Explain binary search with slides")

            assert result["type"] == "theory"
            assert result["topic"] == "Binary Search"
            assert result["format"] == "slides"

    @pytest.mark.asyncio
    async def test_classify_lab_request(self, mock_gemini_service):
        """Test classifying a lab request."""
        mock_gemini_service.generate_without_files = AsyncMock(
            return_value='{"type": "lab", "topic": "Sorting", "format": "code"}'
        )

        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Write Python code for bubble sort")

            assert result["type"] == "lab"
            assert result["format"] == "code"

    @pytest.mark.asyncio
    async def test_classify_chat_request(self, mock_gemini_service):
        """Test classifying a chat request."""
        mock_gemini_service.generate_without_files = AsyncMock(
            return_value='{"type": "chat", "topic": "general", "format": "text"}'
        )

        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Hello, how are you?")

            assert result["type"] == "chat"

    @pytest.mark.asyncio
    async def test_classify_handles_error_gracefully(self, mock_gemini_service):
        """Test that errors default to chat."""
        mock_gemini_service.generate_without_files = AsyncMock(
            side_effect=Exception("API Error")
        )

        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Some query")

            assert result["type"] == "chat"
            assert "error" in result

    @pytest.mark.asyncio
    async def test_classify_handles_invalid_json(self, mock_gemini_service):
        """Test handling of invalid JSON response."""
        mock_gemini_service.generate_without_files = AsyncMock(
            return_value="This is not valid JSON"
        )

        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Some query")

            # Should default to chat
            assert result["type"] == "chat"

    @pytest.mark.asyncio
    async def test_classify_extracts_json_from_markdown(self, mock_gemini_service):
        """Test extracting JSON from markdown code block."""
        mock_gemini_service.generate_without_files = AsyncMock(
            return_value='```json\n{"type": "theory", "topic": "Trees", "format": "notes"}\n```'
        )

        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            result = await router.classify_request("Explain trees")

            assert result["type"] == "theory"
            assert result["topic"] == "Trees"

    def test_build_classification_prompt(self, mock_gemini_service):
        """Test prompt building."""
        with patch('app.intelligence.router.get_gemini_service', return_value=mock_gemini_service):
            from app.intelligence.router import IntentRouter
            router = IntentRouter()

            prompt = router._build_classification_prompt("Test query")

            assert "Test query" in prompt
            assert "theory" in prompt
            assert "lab" in prompt
            assert "chat" in prompt
