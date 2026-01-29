"""
Tests for main FastAPI application.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint returns correct status."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "ai-backend",
        "version": "0.1.0"
    }


def test_health_check_status_field():
    """Test that health check includes status field."""
    response = client.get("/health")
    data = response.json()

    assert "status" in data
    assert data["status"] == "healthy"


def test_health_check_service_field():
    """Test that health check includes service field."""
    response = client.get("/health")
    data = response.json()

    assert "service" in data
    assert data["service"] == "ai-backend"


def test_root_endpoint():
    """Test the root endpoint returns API information."""
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()

    assert "message" in data
    assert "docs" in data
    assert "health" in data
    assert data["docs"] == "/docs"
    assert data["health"] == "/health"


def test_rag_router_root():
    """Test RAG router endpoints are accessible via OpenAPI docs."""
    # The RAG router has actual endpoints now (/ingest, /search)
    # We can verify they're registered by checking the OpenAPI schema
    response = client.get("/openapi.json")

    assert response.status_code == 200
    openapi_schema = response.json()

    # Verify RAG endpoints are in the schema
    assert "/rag/ingest" in openapi_schema["paths"]
    assert "/rag/search" in openapi_schema["paths"]


def test_gemini_router_endpoints():
    """Test Gemini RAG router endpoints are accessible via OpenAPI docs."""
    response = client.get("/openapi.json")

    assert response.status_code == 200
    openapi_schema = response.json()

    # Verify Gemini endpoints are in the schema
    assert "/gemini/upload" in openapi_schema["paths"]
    assert "/gemini/ask" in openapi_schema["paths"]


def test_generation_router_root():
    """Test Generation router is accessible."""
    response = client.get("/generation/")

    assert response.status_code == 200
    data = response.json()

    assert data["service"] == "generation"
    assert data["status"] == "ready"


def test_validation_router_root():
    """Test Validation router is accessible."""
    response = client.get("/validation/")

    assert response.status_code == 200
    data = response.json()

    assert data["service"] == "validation"
    assert data["status"] == "ready"
