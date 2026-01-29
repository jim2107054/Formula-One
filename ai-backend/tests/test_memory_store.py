"""
Tests for Memory Store

Tests the MemoryStore class for document ingestion and retrieval.
Uses mocking for Pinecone inference API.
"""

import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from io import BytesIO
import tempfile
import shutil
import os


class TestMemoryStore:
    """Tests for MemoryStore class with mocked Pinecone."""

    @pytest.fixture
    def mock_pinecone_client(self):
        """Create a mock Pinecone client with inference API."""
        mock_pc = MagicMock()

        # Mock index
        mock_index = MagicMock()
        mock_index.describe_index_stats.return_value = MagicMock(
            total_vector_count=0)
        mock_index.upsert = MagicMock()
        mock_index.query = MagicMock(return_value={"matches": []})
        mock_index.delete = MagicMock()
        mock_pc.Index.return_value = mock_index

        # Mock inference API
        mock_pc.inference.embed.return_value = [{'values': [0.1] * 1024}]

        return mock_pc, mock_index

    @pytest.fixture
    def memory_store(self, mock_pinecone_client):
        """Create a MemoryStore with mocked dependencies."""
        mock_pc, mock_index = mock_pinecone_client

        with patch('app.rag.memory_store.Pinecone') as mock_pinecone:
            mock_pinecone.return_value = mock_pc

            from app.rag.memory_store import MemoryStore
            store = MemoryStore(index_name="test-index")
            store.pc = mock_pc
            store.index = mock_index
            return store

    @pytest.fixture
    def mock_upload_file(self):
        """Create a mock UploadFile."""
        mock_file = MagicMock()
        mock_file.filename = "test_document.txt"
        mock_file.read = AsyncMock(
            return_value=b"This is test content for the document. It contains important information about algorithms and data structures.")
        return mock_file

    @pytest.mark.asyncio
    async def test_ingest_text_document(self, memory_store, mock_upload_file):
        """Test ingesting a text document."""
        result = await memory_store.ingest_document(mock_upload_file)

        assert result["status"] == "success"
        assert result["filename"] == "test_document.txt"
        assert result["chunks_added"] >= 1

    @pytest.mark.asyncio
    async def test_ingest_calls_pinecone_upsert(self, memory_store, mock_upload_file):
        """Test that ingestion calls Pinecone upsert."""
        await memory_store.ingest_document(mock_upload_file)

        # Verify upsert was called
        memory_store.index.upsert.assert_called_once()

    def test_search_context_empty_index(self, memory_store):
        """Test searching empty index."""
        result = memory_store.search_context("algorithms")

        assert result == ""

    def test_search_context_returns_relevant(self, memory_store):
        """Test that search returns relevant context."""
        # Setup mock to return vectors
        memory_store.index.describe_index_stats.return_value = MagicMock(
            total_vector_count=5)
        memory_store.index.query.return_value = {
            "matches": [
                {"id": "1", "metadata": {
                    "text": "Algorithms are efficient procedures", "source": "doc.txt"}},
                {"id": "2", "metadata": {
                    "text": "Data structures organize data", "source": "doc.txt"}}
            ]
        }

        result = memory_store.search_context("algorithms")

        assert len(result) > 0
        assert "Algorithms" in result or "Data structures" in result

    @pytest.mark.asyncio
    async def test_get_all_sources(self, memory_store, mock_upload_file):
        """Test getting all source filenames."""
        await memory_store.ingest_document(mock_upload_file)

        sources = memory_store.get_all_sources()

        assert "test_document.txt" in sources

    def test_clear_all(self, memory_store):
        """Test clearing all documents."""
        memory_store._sources.add("test.txt")

        result = memory_store.clear_all()

        assert result["status"] == "success"
        memory_store.index.delete.assert_called_once_with(delete_all=True)
        assert len(memory_store._sources) == 0

    def test_get_vector_count(self, memory_store):
        """Test getting vector count."""
        memory_store.index.describe_index_stats.return_value = MagicMock(
            total_vector_count=42)

        count = memory_store.get_vector_count()

        assert count == 42

    def test_split_text_short(self, memory_store):
        """Test splitting short text."""
        text = "Short text"
        chunks = memory_store._split_text(text, chunk_size=1000)

        assert len(chunks) == 1
        assert chunks[0] == "Short text"

    def test_split_text_long(self, memory_store):
        """Test splitting long text into chunks."""
        text = "A" * 2500
        chunks = memory_store._split_text(text, chunk_size=1000, overlap=100)

        assert len(chunks) >= 2

    def test_split_text_empty(self, memory_store):
        """Test splitting empty text."""
        chunks = memory_store._split_text("", chunk_size=1000)

        assert chunks == []

    @pytest.mark.asyncio
    async def test_ingest_pdf_fallback(self, memory_store):
        """Test PDF ingestion with fallback message."""
        mock_file = MagicMock()
        mock_file.filename = "test.pdf"
        # Invalid PDF bytes
        mock_file.read = AsyncMock(return_value=b"not a real pdf")

        result = await memory_store.ingest_document(mock_file)

        # Should still succeed but with error message in content
        assert result["status"] == "success"


class TestMemoryStoreIntegration:
    """Integration tests for MemoryStore with mocked Pinecone."""

    @pytest.mark.asyncio
    async def test_full_workflow(self):
        """Test full ingest -> search workflow."""
        # Setup mock Pinecone client
        mock_pc = MagicMock()
        mock_index = MagicMock()
        mock_index.describe_index_stats.return_value = MagicMock(
            total_vector_count=0)
        mock_index.upsert = MagicMock()
        mock_index.delete = MagicMock()
        mock_pc.Index.return_value = mock_index
        mock_pc.inference.embed.return_value = [{'values': [0.1] * 1024}]

        with patch('app.rag.memory_store.Pinecone') as mock_pinecone:
            mock_pinecone.return_value = mock_pc

            from app.rag.memory_store import MemoryStore
            store = MemoryStore(index_name="test-index")
            store.pc = mock_pc
            store.index = mock_index

            # Create mock file
            mock_file = MagicMock()
            mock_file.filename = "algorithms.txt"
            mock_file.read = AsyncMock(
                return_value=b"Binary search is an efficient algorithm for finding items in sorted arrays. It has O(log n) time complexity."
            )

            # Ingest
            result = await store.ingest_document(mock_file)
            assert result["status"] == "success"
            mock_index.upsert.assert_called_once()

            # Setup search return
            mock_index.describe_index_stats.return_value = MagicMock(
                total_vector_count=1)
            mock_index.query.return_value = {
                "matches": [
                    {"id": "1", "metadata": {
                        "text": "Binary search is an efficient algorithm", "source": "algorithms.txt"}}
                ]
            }

            # Search
            context = store.search_context("binary search complexity")
            assert "Binary search" in context
