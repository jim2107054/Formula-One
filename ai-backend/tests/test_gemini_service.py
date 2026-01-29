"""
Tests for Gemini RAG Service

Tests the GeminiService class for document upload and question answering.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import os

from app.gemini_rag.service import GeminiService


class TestGeminiServiceInit:
    """Test GeminiService initialization"""

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    def test_init_success(self, mock_client_class):
        """Test successful initialization with API key"""
        mock_client = Mock()
        mock_client_class.return_value = mock_client

        service = GeminiService()

        # Verify Client was initialized
        mock_client_class.assert_called_once()

        # Verify model name is set
        assert service.model_name == "gemini-2.5-flash-lite"

        # Verify uploaded_files list is empty
        assert service.uploaded_files == []

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {}, clear=True)
    def test_init_no_api_key(self, mock_client_class):
        """Test initialization fails without API key"""
        with pytest.raises(ValueError) as exc_info:
            GeminiService()

        assert "GEMINI_API_KEY environment variable is not set" in str(
            exc_info.value)


class TestUploadDocument:
    """Test document upload functionality"""

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @patch('app.gemini_rag.service.tempfile.NamedTemporaryFile')
    @patch('app.gemini_rag.service.os.unlink')
    @pytest.mark.asyncio
    async def test_upload_document_pdf(self, mock_unlink, mock_tempfile, mock_client_class):
        """Test successful PDF document upload"""
        # Setup mocks
        mock_temp_file = MagicMock()
        mock_temp_file.name = '/tmp/test.pdf'
        mock_tempfile.return_value.__enter__.return_value = mock_temp_file

        mock_uploaded = Mock()
        mock_uploaded.name = 'test_document.pdf'
        mock_uploaded.uri = 'https://generativelanguage.googleapis.com/v1beta/files/test123'

        mock_client = Mock()
        mock_client.files.upload.return_value = mock_uploaded
        mock_client_class.return_value = mock_client

        # Create service and upload
        service = GeminiService()
        file_content = b"PDF content here"

        result = await service.upload_document(file_content, mime_type="application/pdf")

        # Verify temp file was written
        mock_temp_file.write.assert_called_once_with(file_content)

        # Verify upload was called
        mock_client.files.upload.assert_called_once_with(
            path='/tmp/test.pdf'
        )

        # Verify file was added to uploaded_files
        assert len(service.uploaded_files) == 1
        assert service.uploaded_files[0] == mock_uploaded

        # Verify temp file was deleted
        mock_unlink.assert_called_once_with('/tmp/test.pdf')

        # Verify result
        assert result == {
            "filename": "test_document.pdf",
            "uri": "https://generativelanguage.googleapis.com/v1beta/files/test123"
        }

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @patch('app.gemini_rag.service.tempfile.NamedTemporaryFile')
    @patch('app.gemini_rag.service.os.unlink')
    @pytest.mark.asyncio
    async def test_upload_document_text(self, mock_unlink, mock_tempfile, mock_client_class):
        """Test successful text document upload"""
        mock_temp_file = MagicMock()
        mock_temp_file.name = '/tmp/test.txt'
        mock_tempfile.return_value.__enter__.return_value = mock_temp_file

        mock_uploaded = Mock()
        mock_uploaded.name = 'test_document.txt'
        mock_uploaded.uri = 'https://generativelanguage.googleapis.com/v1beta/files/test456'

        mock_client = Mock()
        mock_client.files.upload.return_value = mock_uploaded
        mock_client_class.return_value = mock_client

        service = GeminiService()
        result = await service.upload_document(b"Text content", mime_type="text/plain")

        assert result["filename"] == "test_document.txt"
        assert "uri" in result

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @patch('app.gemini_rag.service.tempfile.NamedTemporaryFile')
    @pytest.mark.asyncio
    async def test_upload_document_failure(self, mock_tempfile, mock_client_class):
        """Test document upload failure"""
        mock_temp_file = MagicMock()
        mock_temp_file.name = '/tmp/test.pdf'
        mock_tempfile.return_value.__enter__.return_value = mock_temp_file

        # Make upload raise an exception
        mock_client = Mock()
        mock_client.files.upload.side_effect = Exception("Upload failed")
        mock_client_class.return_value = mock_client

        service = GeminiService()

        with pytest.raises(Exception) as exc_info:
            await service.upload_document(b"content", mime_type="application/pdf")

        assert "Failed to upload document" in str(exc_info.value)


class TestAskQuestion:
    """Test question answering functionality"""

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @pytest.mark.asyncio
    async def test_ask_question_success(self, mock_client_class):
        """Test successful question answering"""
        # Setup mock client
        mock_response = Mock()
        mock_response.text = "Binary search has O(log n) complexity."

        mock_client = Mock()
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client

        # Create service and add mock uploaded file
        service = GeminiService()
        mock_file = Mock()
        service.uploaded_files = [mock_file]

        # Ask question
        query = "What is the complexity of binary search?"
        result = await service.ask_question(query)

        # Verify generate_content was called with correct model and content
        mock_client.models.generate_content.assert_called_once_with(
            model="gemini-2.5-flash-lite",
            contents=[mock_file, query]
        )

        # Verify result
        assert result == "Binary search has O(log n) complexity."

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @pytest.mark.asyncio
    async def test_ask_question_no_documents(self, mock_client_class):
        """Test asking question without uploaded documents"""
        service = GeminiService()

        with pytest.raises(Exception) as exc_info:
            await service.ask_question("What is binary search?")

        assert "No documents uploaded" in str(exc_info.value)

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @pytest.mark.asyncio
    async def test_ask_question_multiple_documents(self, mock_client_class):
        """Test asking question with multiple uploaded documents"""
        mock_response = Mock()
        mock_response.text = "Combined answer from multiple documents."

        mock_client = Mock()
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client

        service = GeminiService()
        mock_file1 = Mock()
        mock_file2 = Mock()
        service.uploaded_files = [mock_file1, mock_file2]

        query = "Explain sorting algorithms"
        result = await service.ask_question(query)

        # Verify both files were included
        mock_client.models.generate_content.assert_called_once_with(
            model="gemini-2.5-flash-lite",
            contents=[mock_file1, mock_file2, query]
        )
        assert result == "Combined answer from multiple documents."

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    @pytest.mark.asyncio
    async def test_ask_question_generation_failure(self, mock_client_class):
        """Test handling of generation failure"""
        mock_client = Mock()
        mock_client.models.generate_content.side_effect = Exception(
            "Generation failed")
        mock_client_class.return_value = mock_client

        service = GeminiService()
        service.uploaded_files = [Mock()]

        with pytest.raises(Exception) as exc_info:
            await service.ask_question("Test query")

        assert "Failed to generate response" in str(exc_info.value)


class TestHelperMethods:
    """Test helper methods"""

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    def test_get_suffix(self, mock_client_class):
        """Test MIME type to suffix conversion"""
        service = GeminiService()

        assert service._get_suffix("application/pdf") == ".pdf"
        assert service._get_suffix("text/plain") == ".txt"
        assert service._get_suffix("text/html") == ".html"
        assert service._get_suffix("application/json") == ".json"
        assert service._get_suffix("text/markdown") == ".md"
        assert service._get_suffix("unknown/type") == ".bin"

    @patch('app.gemini_rag.service.genai.Client')
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-api-key'})
    def test_clear_documents(self, mock_client_class):
        """Test clearing uploaded documents"""
        service = GeminiService()
        service.uploaded_files = [Mock(), Mock(), Mock()]

        assert len(service.uploaded_files) == 3

        service.clear_documents()

        assert len(service.uploaded_files) == 0
        assert service.uploaded_files == []
