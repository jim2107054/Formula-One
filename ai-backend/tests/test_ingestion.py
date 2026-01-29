"""
Tests for the Ingestion Service
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from langchain_core.documents import Document

from app.rag.ingestion.service import ingest_text, ingest_multiple_texts


class TestIngestText:
    """Test cases for the ingest_text function"""

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_success(self, mock_vector_store_manager):
        """Test successful text ingestion"""
        # Setup mock
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        # Test data
        content = "This is a test document. " * 100  # Long enough to create chunks
        metadata = {"source_id": "test_1", "type": "theory", "week": 1}

        # Execute
        result = ingest_text(content, metadata)

        # Verify
        assert result is True
        mock_vector_store.add_documents.assert_called_once()

        # Check that documents were created
        call_args = mock_vector_store.add_documents.call_args[0][0]
        assert len(call_args) > 0
        assert all(isinstance(doc, Document) for doc in call_args)
        assert all(doc.metadata == metadata for doc in call_args)

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_empty_content(self, mock_vector_store_manager):
        """Test ingestion with empty content"""
        metadata = {"source_id": "test_1", "type": "theory"}

        result = ingest_text("", metadata)

        assert result is False
        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_whitespace_only(self, mock_vector_store_manager):
        """Test ingestion with whitespace-only content"""
        metadata = {"source_id": "test_1", "type": "theory"}

        result = ingest_text("   \n\n   ", metadata)

        assert result is False
        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_invalid_metadata(self, mock_vector_store_manager):
        """Test ingestion with invalid metadata type"""
        content = "Test content"
        invalid_metadata = "not a dict"

        result = ingest_text(content, invalid_metadata)

        assert result is False
        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_chunking(self, mock_vector_store_manager):
        """Test that text is properly chunked"""
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        # Create content longer than chunk_size (1000 chars)
        content = "A" * 2500  # Should create multiple chunks
        metadata = {"source_id": "test_chunking", "type": "theory"}

        result = ingest_text(content, metadata)

        assert result is True
        call_args = mock_vector_store.add_documents.call_args[0][0]
        assert len(call_args) >= 2  # Should have multiple chunks

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_metadata_preservation(self, mock_vector_store_manager):
        """Test that metadata is preserved across all chunks"""
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        content = "Test content. " * 200
        metadata = {
            "source_id": "test_preserve",
            "type": "lab",
            "week": 5,
            "custom_field": "value"
        }

        result = ingest_text(content, metadata)

        assert result is True
        call_args = mock_vector_store.add_documents.call_args[0][0]

        # Verify all chunks have the same metadata
        for doc in call_args:
            assert doc.metadata == metadata

    @patch('app.rag.ingestion.service.VectorStoreManager')
    def test_ingest_text_exception_handling(self, mock_vector_store_manager):
        """Test exception handling during ingestion"""
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.add_documents.side_effect = Exception(
            "Database error")
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        content = "Test content"
        metadata = {"source_id": "test_error"}

        result = ingest_text(content, metadata)

        assert result is False  # Should return False, not raise exception


class TestIngestMultipleTexts:
    """Test cases for the ingest_multiple_texts function"""

    @patch('app.rag.ingestion.service.ingest_text')
    def test_ingest_multiple_texts_success(self, mock_ingest_text):
        """Test successful batch ingestion"""
        mock_ingest_text.return_value = True

        texts = [
            ("Content 1", {"source_id": "doc_1", "type": "theory"}),
            ("Content 2", {"source_id": "doc_2", "type": "theory"}),
            ("Content 3", {"source_id": "doc_3", "type": "lab"}),
        ]

        result = ingest_multiple_texts(texts)

        assert result["successful"] == 3
        assert result["failed"] == 0
        assert result["total"] == 3
        assert mock_ingest_text.call_count == 3

    @patch('app.rag.ingestion.service.ingest_text')
    def test_ingest_multiple_texts_partial_failure(self, mock_ingest_text):
        """Test batch ingestion with some failures"""
        # First two succeed, third fails
        mock_ingest_text.side_effect = [True, True, False]

        texts = [
            ("Content 1", {"source_id": "doc_1"}),
            ("Content 2", {"source_id": "doc_2"}),
            ("Content 3", {"source_id": "doc_3"}),
        ]

        result = ingest_multiple_texts(texts)

        assert result["successful"] == 2
        assert result["failed"] == 1
        assert result["total"] == 3

    @patch('app.rag.ingestion.service.ingest_text')
    def test_ingest_multiple_texts_empty_list(self, mock_ingest_text):
        """Test batch ingestion with empty list"""
        result = ingest_multiple_texts([])

        assert result["successful"] == 0
        assert result["failed"] == 0
        assert result["total"] == 0
        mock_ingest_text.assert_not_called()

    @patch('app.rag.ingestion.service.ingest_text')
    def test_ingest_multiple_texts_exception(self, mock_ingest_text):
        """Test exception handling in batch ingestion"""
        mock_ingest_text.side_effect = Exception("Unexpected error")

        texts = [
            ("Content 1", {"source_id": "doc_1"}),
        ]

        result = ingest_multiple_texts(texts)

        assert result["successful"] == 0
        assert result["failed"] == 1
        assert result["total"] == 1
        assert "error" in result
