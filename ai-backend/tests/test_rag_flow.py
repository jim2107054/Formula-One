"""
Functional tests for RAG flow (end-to-end)

Tests the complete flow from document ingestion to retrieval
using real vector store operations (no mocking).
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestRAGFlow:
    """Test the complete RAG workflow"""

    def test_ingest_and_search_flow(self):
        """
        Test the full RAG flow:
        1. Ingest a document about binary search
        2. Search for information about binary search complexity
        3. Verify the ingested content is retrieved
        """
        # Step 1: Ingest a document
        ingest_data = {
            "text": "Binary search is an efficient algorithm with O(log n) complexity.",
            "metadata": {"source": "textbook"}
        }

        ingest_response = client.post("/rag/ingest", json=ingest_data)

        # Assert ingestion was successful
        assert ingest_response.status_code == 200
        assert ingest_response.json()["status"] == "success"

        # Step 2: Search for the ingested content
        search_data = {
            "query": "What is the complexity of binary search?",
            "k": 4
        }

        search_response = client.post("/rag/search", json=search_data)

        # Assert search was successful
        assert search_response.status_code == 200

        # Step 3: Verify the content is present in the results
        search_result = search_response.json()
        assert "results" in search_result
        assert len(search_result["results"]) > 0

        # Check that "O(log n)" is present in at least one result
        results_text = " ".join([
            result.get("content", "")
            for result in search_result["results"]
        ])
        assert "O(log n)" in results_text

        # Verify metadata is preserved
        assert any(
            result.get("metadata", {}).get("source") == "textbook"
            for result in search_result["results"]
        )

    def test_multiple_documents_search(self):
        """Test ingesting multiple documents and searching across them"""
        # Ingest multiple documents
        documents = [
            {
                "text": "Merge sort has O(n log n) time complexity and is a stable sorting algorithm.",
                "metadata": {"source": "textbook", "topic": "sorting"}
            },
            {
                "text": "Quick sort is generally faster in practice with average O(n log n) complexity.",
                "metadata": {"source": "textbook", "topic": "sorting"}
            },
            {
                "text": "Bubble sort is a simple algorithm with O(n^2) worst-case complexity.",
                "metadata": {"source": "textbook", "topic": "sorting"}
            }
        ]

        # Ingest all documents
        for doc in documents:
            response = client.post("/rag/ingest", json=doc)
            assert response.status_code == 200
            assert response.json()["status"] == "success"

        # Search for sorting algorithms
        search_data = {
            "query": "Which sorting algorithms have O(n log n) complexity?",
            "k": 5
        }

        search_response = client.post("/rag/search", json=search_data)
        assert search_response.status_code == 200

        results = search_response.json()["results"]
        assert len(results) > 0

        # Verify we get relevant results
        results_text = " ".join([r.get("content", "") for r in results])
        # Should contain information about merge sort or quick sort
        assert "merge sort" in results_text.lower() or "quick sort" in results_text.lower()

    def test_search_with_custom_k(self):
        """Test searching with different k values"""
        # Ingest a document
        ingest_data = {
            "text": "Dynamic programming is an optimization technique that breaks down problems into overlapping subproblems.",
            "metadata": {"source": "textbook", "topic": "algorithms"}
        }

        ingest_response = client.post("/rag/ingest", json=ingest_data)
        assert ingest_response.status_code == 200

        # Search with k=1
        search_data = {
            "query": "What is dynamic programming?",
            "k": 1
        }

        search_response = client.post("/rag/search", json=search_data)
        assert search_response.status_code == 200

        results = search_response.json()["results"]
        # Should return at most k results
        assert len(results) <= 1

    def test_search_no_match(self):
        """Test searching for content that doesn't exist in the vector store"""
        # Search for something very specific that likely doesn't exist
        search_data = {
            "query": "xyzabc123 nonexistent quantum flux capacitor",
            "k": 4
        }

        search_response = client.post("/rag/search", json=search_data)
        assert search_response.status_code == 200

        # Should still return a response, even if no perfect match
        results = search_response.json()["results"]
        assert "results" in search_response.json()
        # Results might be empty or contain unrelated documents
        assert isinstance(results, list)
