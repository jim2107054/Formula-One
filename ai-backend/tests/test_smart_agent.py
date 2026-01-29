"""
Tests for Smart Agent API

Tests the /api/v1/agent endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
import tempfile
import shutil


class TestSmartAgentAPI:
    """Tests for Smart Agent API endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        from app.main import app
        return TestClient(app)

    @pytest.fixture
    def mock_services(self):
        """Mock all agent services."""
        with patch('app.api.smart_agent.get_intent_router') as mock_router, \
                patch('app.api.smart_agent.get_memory_store') as mock_memory, \
                patch('app.api.smart_agent.get_theory_generator') as mock_theory, \
                patch('app.api.smart_agent.get_lab_generator') as mock_lab, \
                patch('app.api.smart_agent.get_gemini_service') as mock_gemini:

            # Setup intent router
            router_instance = MagicMock()
            router_instance.classify_request = AsyncMock(return_value={
                "type": "theory",
                "topic": "Binary Search",
                "format": "notes"
            })
            mock_router.return_value = router_instance

            # Setup memory store
            memory_instance = MagicMock()
            memory_instance.search_context.return_value = "Context about binary search"
            memory_instance.get_all_sources.return_value = ["doc1.pdf"]
            memory_instance.get_vector_count.return_value = 5
            memory_instance.ingest_document = AsyncMock(return_value={
                "status": "success",
                "filename": "test.pdf",
                "chunks_added": 3
            })
            memory_instance.clear_all.return_value = {
                "status": "success", "message": "Cleared"}
            mock_memory.return_value = memory_instance

            # Setup theory generator
            theory_instance = MagicMock()
            theory_instance.generate_with_context = AsyncMock(return_value={
                "topic": "Binary Search",
                "type": "notes",
                "content": "# Binary Search\n\nGenerated notes..."
            })
            theory_instance.generate_material = AsyncMock(return_value={
                "topic": "Binary Search",
                "type": "notes",
                "content": "Generated content"
            })
            mock_theory.return_value = theory_instance

            # Setup lab generator
            lab_instance = MagicMock()
            lab_instance.generate_with_context = AsyncMock(return_value={
                "topic": "Sorting",
                "language": "python",
                "lab_content": '{"problem_statement": "Implement sort"}'
            })
            mock_lab.return_value = lab_instance

            # Setup gemini service
            gemini_instance = MagicMock()
            gemini_instance.chat_with_context = AsyncMock(
                return_value="Chat response")
            gemini_instance.generate_without_files = AsyncMock(
                return_value="Generated response")
            mock_gemini.return_value = gemini_instance

            yield {
                "router": router_instance,
                "memory": memory_instance,
                "theory": theory_instance,
                "lab": lab_instance,
                "gemini": gemini_instance
            }

    def test_agent_root(self, client, mock_services):
        """Test agent root endpoint."""
        response = client.get("/api/v1/agent/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "smart-agent"
        assert data["status"] == "ready"

    def test_smart_ask_theory(self, client, mock_services):
        """Test smart ask for theory content."""
        response = client.post(
            "/api/v1/agent/ask",
            json={"query": "Explain binary search with notes"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["intent"]["type"] == "theory"
        assert data["response"]["type"] == "theory"
        assert "content" in data["response"]

    def test_smart_ask_lab(self, client, mock_services):
        """Test smart ask for lab content."""
        mock_services["router"].classify_request = AsyncMock(return_value={
            "type": "lab",
            "topic": "Sorting",
            "format": "code"
        })

        response = client.post(
            "/api/v1/agent/ask",
            json={"query": "Write code for sorting"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["intent"]["type"] == "lab"
        assert data["response"]["type"] == "lab"

    def test_smart_ask_chat(self, client, mock_services):
        """Test smart ask for chat."""
        mock_services["router"].classify_request = AsyncMock(return_value={
            "type": "chat",
            "topic": "general",
            "format": "text"
        })

        response = client.post(
            "/api/v1/agent/ask",
            json={"query": "Hello there"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["intent"]["type"] == "chat"
        assert data["response"]["type"] == "chat"

    def test_memory_status(self, client, mock_services):
        """Test memory status endpoint."""
        response = client.get("/api/v1/agent/memory/status")

        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert "total_chunks" in data

    def test_clear_memory(self, client, mock_services):
        """Test clearing memory."""
        response = client.delete("/api/v1/agent/memory/clear")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_classify_only(self, client, mock_services):
        """Test classification without generation."""
        response = client.post(
            "/api/v1/agent/classify",
            json={"query": "Explain trees"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "intent" in data
        assert "query" in data

    def test_upload_document(self, client, mock_services):
        """Test document upload."""
        # Create a test file
        content = b"Test document content about algorithms"

        response = client.post(
            "/api/v1/agent/upload",
            files={"file": ("test.txt", content, "text/plain")}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["filename"] == "test.pdf"

    def test_ask_with_sources_count(self, client, mock_services):
        """Test that sources_used is returned."""
        response = client.post(
            "/api/v1/agent/ask",
            json={"query": "Explain something"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "sources_used" in data

    def test_ask_error_handling(self, client):
        """Test error handling in ask endpoint."""
        with patch('app.api.smart_agent.get_intent_router') as mock:
            mock.return_value.classify_request = AsyncMock(
                side_effect=Exception("Test error")
            )

            response = client.post(
                "/api/v1/agent/ask",
                json={"query": "Test"}
            )

            assert response.status_code == 500
            assert "Agent error" in response.json()["detail"]


class TestSmartAgentIntegration:
    """Integration tests for smart agent flow."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        from app.main import app
        return TestClient(app)

    def test_full_flow_with_mocks(self, client):
        """Test the full classify -> retrieve -> generate flow."""
        with patch('app.api.smart_agent.get_intent_router') as mock_router, \
                patch('app.api.smart_agent.get_memory_store') as mock_memory, \
                patch('app.api.smart_agent.get_theory_generator') as mock_theory:

            # Setup mocks
            mock_router.return_value.classify_request = AsyncMock(return_value={
                "type": "theory",
                "topic": "Hash Tables",
                "format": "slides"
            })

            mock_memory.return_value.search_context.return_value = "Hash tables store key-value pairs"

            mock_theory.return_value.generate_with_context = AsyncMock(return_value={
                "topic": "Hash Tables",
                "type": "slides",
                "content": '[{"title": "Hash Tables", "bullet_points": ["Fast lookup"]}]'
            })

            response = client.post(
                "/api/v1/agent/ask",
                json={"query": "Create slides about hash tables"}
            )

            assert response.status_code == 200
            data = response.json()

            # Verify intent classification
            assert data["intent"]["type"] == "theory"
            assert data["intent"]["topic"] == "Hash Tables"
            assert data["intent"]["format"] == "slides"

            # Verify response
            assert data["response"]["type"] == "theory"
            assert data["response"]["format"] == "slides"
            assert "Hash Tables" in data["response"]["content"]
