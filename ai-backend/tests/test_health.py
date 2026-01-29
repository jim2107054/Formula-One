"""
Tests for Health Check endpoints
"""
import pytest
from datetime import datetime


class TestHealthEndpoint:
    """Test suite for health check endpoint"""
    
    def test_health_check_success(self, client, api_prefix):
        """Test health check endpoint returns 200 OK"""
        response = client.get(f"{api_prefix}/health")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
    
    def test_health_check_response_structure(self, client, api_prefix):
        """Test health check response has correct structure"""
        response = client.get(f"{api_prefix}/health")
        data = response.json()
        
        # Check all required fields are present
        assert "status" in data
        assert "message" in data
        assert "timestamp" in data
        assert "version" in data
        assert "python_version" in data
    
    def test_health_check_status_healthy(self, client, api_prefix):
        """Test health check returns healthy status"""
        response = client.get(f"{api_prefix}/health")
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "running" in data["message"].lower()
    
    def test_health_check_version_format(self, client, api_prefix):
        """Test health check returns valid version"""
        response = client.get(f"{api_prefix}/health")
        data = response.json()
        
        assert data["version"] == "0.1.0"
        assert len(data["python_version"]) > 0
    
    def test_health_check_timestamp_valid(self, client, api_prefix):
        """Test health check returns valid timestamp"""
        response = client.get(f"{api_prefix}/health")
        data = response.json()
        
        # Check timestamp can be parsed
        timestamp = datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))
        assert isinstance(timestamp, datetime)
    
    def test_health_check_multiple_calls(self, client, api_prefix):
        """Test health check is consistent across multiple calls"""
        response1 = client.get(f"{api_prefix}/health")
        response2 = client.get(f"{api_prefix}/health")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json()["status"] == response2.json()["status"]


class TestReadinessEndpoint:
    """Test suite for readiness check endpoint"""
    
    def test_readiness_check_success(self, client, api_prefix):
        """Test readiness check endpoint returns 200 OK"""
        response = client.get(f"{api_prefix}/health/ready")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
    
    def test_readiness_check_response_structure(self, client, api_prefix):
        """Test readiness check response has correct structure"""
        response = client.get(f"{api_prefix}/health/ready")
        data = response.json()
        
        # Check all required fields are present
        assert "ready" in data
        assert "message" in data
        assert "timestamp" in data
    
    def test_readiness_check_is_ready(self, client, api_prefix):
        """Test readiness check returns ready status"""
        response = client.get(f"{api_prefix}/health/ready")
        data = response.json()
        
        assert data["ready"] is True
        assert "ready" in data["message"].lower()
    
    def test_readiness_check_timestamp_valid(self, client, api_prefix):
        """Test readiness check returns valid timestamp"""
        response = client.get(f"{api_prefix}/health/ready")
        data = response.json()
        
        # Check timestamp can be parsed
        timestamp = datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))
        assert isinstance(timestamp, datetime)


class TestRootEndpoint:
    """Test suite for root endpoint"""
    
    def test_root_endpoint_success(self, client):
        """Test root endpoint returns 200 OK"""
        response = client.get("/")
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
    
    def test_root_endpoint_response_structure(self, client):
        """Test root endpoint response has correct structure"""
        response = client.get("/")
        data = response.json()
        
        assert "service" in data
        assert "version" in data
        assert "status" in data
        assert "docs" in data
    
    def test_root_endpoint_service_info(self, client):
        """Test root endpoint returns correct service info"""
        response = client.get("/")
        data = response.json()
        
        assert "AI Backend" in data["service"]
        assert data["version"] == "0.1.0"
        assert data["status"] == "running"
        assert "/api/v1/docs" in data["docs"]
