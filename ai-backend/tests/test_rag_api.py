"""
Tests for RAG API Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

from app.main import app

client = TestClient(app)


class TestIngestEndpoint:
    """Test cases for the /rag/ingest endpoint"""

    @patch('app.api.rag.ingest_text')
    def test_ingest_success(self, mock_ingest_text):
        """Test successful document ingestion"""
        mock_ingest_text.return_value = True

        request_data = {
            "text": "Binary search is an efficient algorithm",
            "metadata": {
                "source_id": "week1_lecture1",
                "type": "theory",
                "week": 1
            }
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 200
        assert response.json() == {"status": "success"}

        mock_ingest_text.assert_called_once_with(
            content=request_data["text"],
            metadata=request_data["metadata"]
        )

    @patch('app.api.rag.ingest_text')
    def test_ingest_failure(self, mock_ingest_text):
        """Test ingestion failure"""
        mock_ingest_text.return_value = False

        request_data = {
            "text": "Some text",
            "metadata": {"source_id": "doc_1"}
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 400
        assert "failed" in response.json()["detail"].lower()

    @patch('app.api.rag.ingest_text')
    def test_ingest_exception(self, mock_ingest_text):
        """Test ingestion with exception"""
        mock_ingest_text.side_effect = Exception("Database error")

        request_data = {
            "text": "Some text",
            "metadata": {"source_id": "doc_1"}
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 500
        assert "error" in response.json()["detail"].lower()

    def test_ingest_invalid_request_missing_text(self):
        """Test ingestion with missing text field"""
        request_data = {
            "metadata": {"source_id": "doc_1"}
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 422  # Validation error

    def test_ingest_invalid_request_missing_metadata(self):
        """Test ingestion with missing metadata field"""
        request_data = {
            "text": "Some text"
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 422  # Validation error

    @patch('app.api.rag.ingest_text')
    def test_ingest_empty_text(self, mock_ingest_text):
        """Test ingestion with empty text"""
        mock_ingest_text.return_value = False

        request_data = {
            "text": "",
            "metadata": {"source_id": "doc_1"}
        }

        response = client.post("/rag/ingest", json=request_data)

        # The endpoint should accept it but ingest_text will return False
        assert response.status_code == 400

    @patch('app.api.rag.ingest_text')
    def test_ingest_with_complex_metadata(self, mock_ingest_text):
        """Test ingestion with complex metadata"""
        mock_ingest_text.return_value = True

        request_data = {
            "text": "Code example",
            "metadata": {
                "source_id": "week1_lab1",
                "type": "lab",
                "week": 1,
                "language": "python",
                "tags": ["sorting", "algorithms"]
            }
        }

        response = client.post("/rag/ingest", json=request_data)

        assert response.status_code == 200
        assert response.json() == {"status": "success"}


class TestSearchEndpoint:
    """Test cases for the /rag/search endpoint"""

    @patch('app.api.rag.query_rag')
    def test_search_success(self, mock_query_rag):
        """Test successful search"""
        mock_results = [
            {
                "content": "Binary search is an efficient algorithm",
                "metadata": {"source_id": "doc_1", "type": "theory", "week": 1}
            },
            {
                "content": "def binary_search(arr, target): ...",
                "metadata": {"source_id": "doc_2", "type": "lab", "week": 1}
            }
        ]
        mock_query_rag.return_value = mock_results

        request_data = {
            "query": "binary search",
            "k": 4
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 200
        assert response.json() == {"results": mock_results}

        mock_query_rag.assert_called_once_with(
            query_text=request_data["query"],
            k=request_data["k"]
        )

    @patch('app.api.rag.query_rag')
    def test_search_default_k(self, mock_query_rag):
        """Test search with default k value"""
        mock_query_rag.return_value = []

        request_data = {
            "query": "sorting algorithms"
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 200
        mock_query_rag.assert_called_once_with(
            query_text=request_data["query"],
            k=4  # Default value
        )

    @patch('app.api.rag.query_rag')
    def test_search_custom_k(self, mock_query_rag):
        """Test search with custom k value"""
        mock_query_rag.return_value = []

        request_data = {
            "query": "recursion",
            "k": 10
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 200
        mock_query_rag.assert_called_once_with(
            query_text=request_data["query"],
            k=10
        )

    @patch('app.api.rag.query_rag')
    def test_search_no_results(self, mock_query_rag):
        """Test search with no results"""
        mock_query_rag.return_value = []

        request_data = {
            "query": "nonexistent topic",
            "k": 4
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 200
        assert response.json() == {"results": []}

    @patch('app.api.rag.query_rag')
    def test_search_exception(self, mock_query_rag):
        """Test search with exception"""
        mock_query_rag.side_effect = Exception("Search error")

        request_data = {
            "query": "test query",
            "k": 4
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 500
        assert "error" in response.json()["detail"].lower()

    def test_search_missing_query(self):
        """Test search with missing query field"""
        request_data = {
            "k": 4
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 422  # Validation error

    def test_search_invalid_k_too_low(self):
        """Test search with k value too low"""
        request_data = {
            "query": "test",
            "k": 0
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 422  # Validation error

    def test_search_invalid_k_too_high(self):
        """Test search with k value too high"""
        request_data = {
            "query": "test",
            "k": 21  # Max is 20
        }

        response = client.post("/rag/search", json=request_data)

        assert response.status_code == 422  # Validation error

    def test_search_empty_query(self):
        """Test search with empty query"""
        request_data = {
            "query": "",
            "k": 4
        }

        response = client.post("/rag/search", json=request_data)

        # Should still accept the request (validation happens in query_rag)
        assert response.status_code == 200
