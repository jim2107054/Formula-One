"""
Pytest configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
from app.main import create_app


@pytest.fixture(scope="module")
def test_app():
    """
    Create a test FastAPI application instance
    """
    app = create_app()
    return app


@pytest.fixture(scope="module")
def client(test_app):
    """
    Create a test client for the FastAPI application
    """
    return TestClient(test_app)


@pytest.fixture(scope="session")
def api_prefix():
    """
    Get API prefix from settings
    """
    return "/api/v1"
