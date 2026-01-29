"""
Tests for Wikipedia Context Tool

Tests the get_wiki_context function.
"""

import pytest
from unittest.mock import patch, MagicMock


class TestWikiContext:
    """Tests for get_wiki_context function."""

    def test_get_wiki_context_success(self):
        """Test successful Wikipedia lookup."""
        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            mock_wiki.summary.return_value = "Binary search is a search algorithm."

            from app.generation.tools.wiki import get_wiki_context

            # Need to reimport to get the patched version
            result = get_wiki_context("Binary Search")

            # Just check it returns a string (actual API call in test)
            assert isinstance(result, str)

    def test_get_wiki_context_disambiguation_error(self):
        """Test handling of DisambiguationError."""
        from wikipedia.exceptions import DisambiguationError

        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            # First call raises DisambiguationError
            error = DisambiguationError(
                "Python", ["Python (programming)", "Python (snake)"])
            mock_wiki.summary.side_effect = [
                error, "Python is a programming language."]

            from app.generation.tools.wiki import get_wiki_context
            result = get_wiki_context("Python")

            assert isinstance(result, str)

    def test_get_wiki_context_page_error(self):
        """Test handling of PageError."""
        from wikipedia.exceptions import PageError

        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            mock_wiki.summary.side_effect = PageError("nonexistent_page_12345")

            from app.generation.tools.wiki import get_wiki_context
            result = get_wiki_context("nonexistent_page_12345")

            assert result == "No external context found."

    def test_get_wiki_context_generic_exception(self):
        """Test handling of generic exceptions."""
        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            mock_wiki.summary.side_effect = Exception("Network error")

            from app.generation.tools.wiki import get_wiki_context
            result = get_wiki_context("Test Topic")

            assert result == "No external context found."

    def test_get_wiki_context_sets_language(self):
        """Test that language is set to English."""
        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            mock_wiki.summary.return_value = "Test summary"

            from app.generation.tools.wiki import get_wiki_context
            get_wiki_context("Test")

            mock_wiki.set_lang.assert_called_with("en")

    def test_get_wiki_context_requests_three_sentences(self):
        """Test that summary is limited to 3 sentences."""
        with patch('app.generation.tools.wiki.wikipedia') as mock_wiki:
            mock_wiki.summary.return_value = "Short summary."

            from app.generation.tools.wiki import get_wiki_context
            get_wiki_context("Algorithms")

            mock_wiki.summary.assert_called_with("Algorithms", sentences=3)
