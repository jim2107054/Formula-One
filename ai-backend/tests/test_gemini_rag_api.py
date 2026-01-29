"""
Tests for Gemini RAG API Routes

Tests the FastAPI endpoints for document upload and question answering
using the Gemini service.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from io import BytesIO

from app.main import app

client = TestClient(app)


class TestUploadEndpoint:
    """Test the /gemini/upload endpoint"""

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_upload_document_pdf_success(self, mock_get_service):
        """Test successful PDF upload"""
        # Mock the service
        mock_service = Mock()
        mock_service.upload_document = AsyncMock(return_value={
            "filename": "test.pdf",
            "uri": "https://generativelanguage.googleapis.com/v1beta/files/test123"
        })
        mock_get_service.return_value = mock_service

        # Create test file
        file_content = b"PDF content here"
        files = {
            "file": ("test.pdf", BytesIO(file_content), "application/pdf")
        }

        response = client.post("/gemini/upload", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["filename"] == "test.pdf"
        assert "uri" in data

        # Verify the service was called
        mock_service.upload_document.assert_called_once()

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_upload_document_txt_success(self, mock_get_service):
        """Test successful text file upload"""
        mock_service = Mock()
        mock_service.upload_document = AsyncMock(return_value={
            "filename": "test.txt",
            "uri": "https://generativelanguage.googleapis.com/v1beta/files/test456"
        })
        mock_get_service.return_value = mock_service

        file_content = b"Text content here"
        files = {
            "file": ("test.txt", BytesIO(file_content), "text/plain")
        }

        response = client.post("/gemini/upload", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["filename"] == "test.txt"

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_upload_empty_file(self, mock_get_service):
        """Test uploading an empty file"""
        files = {
            "file": ("empty.pdf", BytesIO(b""), "application/pdf")
        }

        response = client.post("/gemini/upload", files=files)

        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_upload_service_failure(self, mock_get_service):
        """Test handling of service upload failure"""
        mock_service = Mock()
        mock_service.upload_document = AsyncMock(
            side_effect=Exception("Upload failed")
        )
        mock_get_service.return_value = mock_service

        file_content = b"PDF content"
        files = {
            "file": ("test.pdf", BytesIO(file_content), "application/pdf")
        }

        response = client.post("/gemini/upload", files=files)

        assert response.status_code == 500
        assert "Failed to upload document" in response.json()["detail"]

    def test_upload_missing_file(self):
        """Test request without file"""
        response = client.post("/gemini/upload")

        assert response.status_code == 422  # Validation error

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_upload_multiple_file_types(self, mock_get_service):
        """Test uploading different file types"""
        file_types = [
            ("test.pdf", "application/pdf"),
            ("test.txt", "text/plain"),
            ("test.md", "text/markdown"),
            ("test.html", "text/html"),
            ("test.json", "application/json"),
        ]

        for filename, expected_mime in file_types:
            mock_service = Mock()
            mock_service.upload_document = AsyncMock(return_value={
                "filename": filename,
                "uri": f"https://test.com/{filename}"
            })
            mock_get_service.return_value = mock_service

            files = {
                "file": (filename, BytesIO(b"content"), expected_mime)
            }

            response = client.post("/gemini/upload", files=files)
            assert response.status_code == 200


class TestAskEndpoint:
    """Test the /gemini/ask endpoint"""

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_ask_question_success(self, mock_get_service):
        """Test successful question answering"""
        mock_service = Mock()
        mock_service.ask_question = AsyncMock(
            return_value="Binary search has O(log n) time complexity."
        )
        mock_get_service.return_value = mock_service

        request_data = {
            "query": "What is the time complexity of binary search?"
        }

        response = client.post("/gemini/ask", json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "O(log n)" in data["answer"]

        # Verify the service was called
        mock_service.ask_question.assert_called_once_with(
            "What is the time complexity of binary search?"
        )

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_ask_question_no_documents(self, mock_get_service):
        """Test asking question without uploaded documents"""
        mock_service = Mock()
        mock_service.ask_question = AsyncMock(
            side_effect=Exception("No documents uploaded")
        )
        mock_get_service.return_value = mock_service

        request_data = {
            "query": "What is binary search?"
        }

        response = client.post("/gemini/ask", json=request_data)

        assert response.status_code == 400
        assert "No documents have been uploaded" in response.json()["detail"]

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_ask_question_service_failure(self, mock_get_service):
        """Test handling of service failure"""
        mock_service = Mock()
        mock_service.ask_question = AsyncMock(
            side_effect=Exception("Generation failed")
        )
        mock_get_service.return_value = mock_service

        request_data = {
            "query": "Test query"
        }

        response = client.post("/gemini/ask", json=request_data)

        assert response.status_code == 500
        assert "Failed to generate answer" in response.json()["detail"]

    def test_ask_missing_query(self):
        """Test request without query"""
        response = client.post("/gemini/ask", json={})

        assert response.status_code == 422  # Validation error

    def test_ask_empty_query(self):
        """Test request with empty query string"""
        # Pydantic should still accept empty string, but service might handle it
        request_data = {
            "query": ""
        }

        response = client.post("/gemini/ask", json=request_data)

        # Should pass validation (422 would be validation error)
        # The actual behavior depends on service implementation
        assert response.status_code in [200, 400, 500]

    @patch('app.api.gemini_rag_routes.get_gemini_service')
    def test_ask_question_long_query(self, mock_get_service):
        """Test asking question with long query"""
        mock_service = Mock()
        mock_service.ask_question = AsyncMock(
            return_value="This is a detailed answer to your complex question."
        )
        mock_get_service.return_value = mock_service

        long_query = "What is " * 100 + "binary search?"
        request_data = {
            "query": long_query
        }

        response = client.post("/gemini/ask", json=request_data)

        assert response.status_code == 200
        mock_service.ask_question.assert_called_once_with(long_query)


class TestMimeTypeHelper:
    """Test the _get_mime_type helper function"""

    def test_mime_type_detection(self):
        """Test MIME type detection from filename"""
        from app.api.gemini_rag_routes import _get_mime_type

        assert _get_mime_type("test.pdf") == "application/pdf"
        assert _get_mime_type("test.txt") == "text/plain"
        assert _get_mime_type("test.html") == "text/html"
        assert _get_mime_type("test.htm") == "text/html"
        assert _get_mime_type("test.json") == "application/json"
        assert _get_mime_type("test.md") == "text/markdown"
        assert _get_mime_type("test.markdown") == "text/markdown"
        assert _get_mime_type("test.unknown") == "application/octet-stream"
        assert _get_mime_type("noextension") == "application/octet-stream"

    def test_mime_type_case_insensitive(self):
        """Test MIME type detection is case insensitive"""
        from app.api.gemini_rag_routes import _get_mime_type

        assert _get_mime_type("test.PDF") == "application/pdf"
        assert _get_mime_type("test.TXT") == "text/plain"
        assert _get_mime_type("test.HTML") == "text/html"
