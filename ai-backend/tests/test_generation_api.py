"""
Tests for Generation API Endpoints

Tests the /api/v1/generation/theory and /api/v1/generation/lab endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock


class TestGenerationAPI:
    """Tests for Generation API endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        from app.main import app
        return TestClient(app)

    @pytest.fixture
    def mock_theory_generator(self):
        """Mock TheoryGenerator."""
        with patch('app.api.generation_router.get_theory_generator') as mock:
            instance = mock.return_value
            instance.generate_material = AsyncMock(return_value={
                "topic": "Test Topic",
                "type": "notes",
                "content": "Generated theory content"
            })
            yield instance

    @pytest.fixture
    def mock_lab_generator(self):
        """Mock LabGenerator."""
        with patch('app.api.generation_router.get_lab_generator') as mock:
            instance = mock.return_value
            instance.generate_lab = AsyncMock(return_value={
                "topic": "Test Topic",
                "language": "python",
                "lab_content": '{"problem_statement": "Test"}'
            })
            yield instance

    def test_generation_root_endpoint(self, client):
        """Test the generation root endpoint."""
        response = client.get("/api/v1/generation/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "generation"
        assert data["status"] == "ready"

    def test_theory_endpoint_success(self, client, mock_theory_generator):
        """Test successful theory generation."""
        response = client.post(
            "/api/v1/generation/theory",
            json={"topic": "Binary Search", "type": "notes"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["topic"] == "Test Topic"
        assert data["type"] == "notes"
        assert "content" in data

    def test_theory_endpoint_slides(self, client, mock_theory_generator):
        """Test theory generation with slides format."""
        mock_theory_generator.generate_material = AsyncMock(return_value={
            "topic": "Sorting",
            "type": "slides",
            "content": '[{"title": "Intro", "bullet_points": ["Point 1"]}]'
        })

        response = client.post(
            "/api/v1/generation/theory",
            json={"topic": "Sorting", "type": "slides"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "slides"

    def test_theory_endpoint_default_type(self, client, mock_theory_generator):
        """Test theory generation with default type."""
        response = client.post(
            "/api/v1/generation/theory",
            json={"topic": "Arrays"}
        )

        assert response.status_code == 200

    def test_theory_endpoint_missing_topic(self, client):
        """Test theory endpoint with missing topic."""
        response = client.post(
            "/api/v1/generation/theory",
            json={"type": "notes"}
        )

        assert response.status_code == 422  # Validation error

    def test_lab_endpoint_success(self, client, mock_lab_generator):
        """Test successful lab generation."""
        response = client.post(
            "/api/v1/generation/lab",
            json={"topic": "Binary Search", "language": "python"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["topic"] == "Test Topic"
        assert data["language"] == "python"
        assert "lab_content" in data

    def test_lab_endpoint_default_language(self, client, mock_lab_generator):
        """Test lab generation with default language."""
        response = client.post(
            "/api/v1/generation/lab",
            json={"topic": "Linked List"}
        )

        assert response.status_code == 200

    def test_lab_endpoint_custom_language(self, client, mock_lab_generator):
        """Test lab generation with custom language."""
        mock_lab_generator.generate_lab = AsyncMock(return_value={
            "topic": "Arrays",
            "language": "java",
            "lab_content": '{"problem_statement": "Java test"}'
        })

        response = client.post(
            "/api/v1/generation/lab",
            json={"topic": "Arrays", "language": "java"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "java"

    def test_lab_endpoint_missing_topic(self, client):
        """Test lab endpoint with missing topic."""
        response = client.post(
            "/api/v1/generation/lab",
            json={"language": "python"}
        )

        assert response.status_code == 422  # Validation error

    def test_theory_endpoint_error_handling(self, client):
        """Test theory endpoint error handling."""
        with patch('app.api.generation_router.get_theory_generator') as mock:
            instance = mock.return_value
            instance.generate_material = AsyncMock(
                side_effect=Exception("API Error"))

            response = client.post(
                "/api/v1/generation/theory",
                json={"topic": "Test", "type": "notes"}
            )

            assert response.status_code == 500
            assert "Failed to generate theory" in response.json()["detail"]

    def test_lab_endpoint_error_handling(self, client):
        """Test lab endpoint error handling."""
        with patch('app.api.generation_router.get_lab_generator') as mock:
            instance = mock.return_value
            instance.generate_lab = AsyncMock(
                side_effect=Exception("API Error"))

            response = client.post(
                "/api/v1/generation/lab",
                json={"topic": "Test", "language": "python"}
            )

            assert response.status_code == 500
            assert "Failed to generate lab" in response.json()["detail"]
