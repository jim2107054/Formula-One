"""
Tests for the Retrieval Service
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from langchain_core.documents import Document

from app.rag.retriever.service import query_rag, query_by_type, query_by_week


class TestQueryRAG:
    """Test cases for the query_rag function"""

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_success(self, mock_vector_store_manager):
        """Test successful RAG query"""
        # Setup mock documents
        mock_docs = [
            Document(
                page_content="Binary search is an efficient algorithm",
                metadata={"source_id": "doc_1", "type": "theory", "week": 1}
            ),
            Document(
                page_content="def binary_search(arr, target): ...",
                metadata={"source_id": "doc_2", "type": "lab", "week": 1}
            )
        ]

        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.similarity_search.return_value = mock_docs
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        # Execute
        results = query_rag("binary search", k=2)

        # Verify
        assert len(results) == 2
        assert results[0]["content"] == "Binary search is an efficient algorithm"
        assert results[0]["metadata"]["type"] == "theory"
        assert results[1]["content"] == "def binary_search(arr, target): ..."
        assert results[1]["metadata"]["type"] == "lab"

        mock_vector_store.similarity_search.assert_called_once_with(
            query="binary search",
            k=2,
            filter=None
        )

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_empty_query(self, mock_vector_store_manager):
        """Test query with empty text"""
        result = query_rag("", k=4)

        assert result == []
        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_whitespace_query(self, mock_vector_store_manager):
        """Test query with whitespace-only text"""
        result = query_rag("   \n  ", k=4)

        assert result == []
        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_invalid_k(self, mock_vector_store_manager):
        """Test query with invalid k value"""
        result = query_rag("test query", k=0)
        assert result == []

        result = query_rag("test query", k=-1)
        assert result == []

        mock_vector_store_manager.return_value.get_vector_store.assert_not_called()

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_with_filter(self, mock_vector_store_manager):
        """Test query with metadata filter"""
        mock_docs = [
            Document(
                page_content="Theory content",
                metadata={"source_id": "doc_1", "type": "theory"}
            )
        ]

        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.similarity_search.return_value = mock_docs
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        # Execute with filter
        results = query_rag("test", k=3, filter={"type": "theory"})

        # Verify
        assert len(results) == 1
        assert results[0]["metadata"]["type"] == "theory"

        mock_vector_store.similarity_search.assert_called_once_with(
            query="test",
            k=3,
            filter={"type": "theory"}
        )

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_no_results(self, mock_vector_store_manager):
        """Test query that returns no results"""
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.similarity_search.return_value = []
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        results = query_rag("nonexistent query", k=4)

        assert results == []

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_exception_handling(self, mock_vector_store_manager):
        """Test exception handling during query"""
        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.similarity_search.side_effect = Exception(
            "Database error")
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        results = query_rag("test query", k=4)

        assert results == []  # Should return empty list, not raise exception

    @patch('app.rag.retriever.service.VectorStoreManager')
    def test_query_rag_custom_k(self, mock_vector_store_manager):
        """Test query with custom k value"""
        mock_docs = [
            Document(page_content=f"Content {i}", metadata={"id": i})
            for i in range(10)
        ]

        mock_instance = Mock()
        mock_vector_store = Mock()
        mock_vector_store.similarity_search.return_value = mock_docs[:7]
        mock_instance.get_vector_store.return_value = mock_vector_store
        mock_vector_store_manager.return_value = mock_instance

        results = query_rag("test", k=7)

        assert len(results) == 7
        mock_vector_store.similarity_search.assert_called_once_with(
            query="test",
            k=7,
            filter=None
        )


class TestQueryByType:
    """Test cases for the query_by_type function"""

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_type_theory(self, mock_query_rag):
        """Test querying theory content"""
        mock_query_rag.return_value = [
            {"content": "Theory content", "metadata": {"type": "theory"}}
        ]

        results = query_by_type("algorithms", "theory", k=5)

        assert len(results) == 1
        assert results[0]["metadata"]["type"] == "theory"

        mock_query_rag.assert_called_once_with(
            query_text="algorithms",
            k=5,
            filter={'type': 'theory'}
        )

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_type_lab(self, mock_query_rag):
        """Test querying lab content"""
        mock_query_rag.return_value = [
            {"content": "Lab code", "metadata": {"type": "lab"}}
        ]

        results = query_by_type("sorting code", "lab", k=3)

        assert len(results) == 1
        assert results[0]["metadata"]["type"] == "lab"

        mock_query_rag.assert_called_once_with(
            query_text="sorting code",
            k=3,
            filter={'type': 'lab'}
        )

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_type_invalid_type(self, mock_query_rag):
        """Test querying with invalid content type"""
        results = query_by_type("test", "invalid_type", k=4)

        assert results == []
        mock_query_rag.assert_not_called()

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_type_exception(self, mock_query_rag):
        """Test exception handling in query_by_type"""
        mock_query_rag.side_effect = Exception("Error")

        results = query_by_type("test", "theory", k=4)

        assert results == []


class TestQueryByWeek:
    """Test cases for the query_by_week function"""

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_week_success(self, mock_query_rag):
        """Test querying by week number"""
        mock_query_rag.return_value = [
            {"content": "Week 3 content", "metadata": {"week": 3}}
        ]

        results = query_by_week("recursion", week=3, k=4)

        assert len(results) == 1
        assert results[0]["metadata"]["week"] == 3

        mock_query_rag.assert_called_once_with(
            query_text="recursion",
            k=4,
            filter={'week': 3}
        )

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_week_invalid_week(self, mock_query_rag):
        """Test querying with invalid week number"""
        results = query_by_week("test", week=0, k=4)
        assert results == []

        results = query_by_week("test", week=-1, k=4)
        assert results == []

        mock_query_rag.assert_not_called()

    @patch('app.rag.retriever.service.query_rag')
    def test_query_by_week_exception(self, mock_query_rag):
        """Test exception handling in query_by_week"""
        mock_query_rag.side_effect = Exception("Error")

        results = query_by_week("test", week=1, k=4)

        assert results == []
