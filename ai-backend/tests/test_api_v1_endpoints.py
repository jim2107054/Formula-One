"""
Test for /api/v1 Gemini RAG endpoints

Verify that the Gemini RAG routes are accessible under /api/v1 prefix.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from io import BytesIO

from app.main import app

client = TestClient(app)


class TestApiV1Endpoints:
    """Test the /api/v1 Gemini RAG endpoints"""

    def test_api_v1_endpoints_registered(self):
        """Test that /api/v1 endpoints are registered in OpenAPI schema"""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        openapi_schema = response.json()

        # Verify /api/v1 endpoints are in the schema
        assert "/api/v1/upload" in openapi_schema["paths"]
        assert "/api/v1/ask" in openapi_schema["paths"]

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_api_v1_upload_endpoint(self, mock_get_service):
        """Test /api/v1/upload endpoint works"""
        mock_service = Mock()
        mock_service.upload_document = AsyncMock(return_value={
            "filename": "test.pdf",
            "uri": "https://generativelanguage.googleapis.com/v1beta/files/test123"
        })
        mock_get_service.return_value = mock_service

        file_content = b"PDF content here"
        files = {
            "file": ("test.pdf", BytesIO(file_content), "application/pdf")
        }

        response = client.post("/api/v1/upload", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["filename"] == "test.pdf"
        assert "uri" in data

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_api_v1_ask_endpoint(self, mock_get_service):
        """Test /api/v1/ask endpoint works"""
        mock_service = Mock()
        mock_service.ask_question = AsyncMock(
            return_value="Binary search has O(log n) time complexity."
        )
        mock_get_service.return_value = mock_service

        request_data = {
            "query": "What is the time complexity of binary search?"
        }

        response = client.post("/api/v1/ask", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "O(log n)" in data["answer"]
