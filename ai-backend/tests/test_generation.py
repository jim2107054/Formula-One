"""
Tests for Generation router endpoints
"""
import pytest


class TestGenerationRouter:
    """Test suite for Generation router"""
    
    def test_generation_status_endpoint(self, client, api_prefix):
        """Test Generation status endpoint is accessible"""
        response = client.get(f"{api_prefix}/generation/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "message" in data
        assert data["status"] == "not_configured"
    
    def test_generation_generate_endpoint(self, client, api_prefix):
        """Test Generation generate endpoint is accessible"""
        request_data = {
            "prompt": "test prompt",
            "generation_type": "theory"
        }
        response = client.post(f"{api_prefix}/generation/generate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "content" in data
        assert "generation_type" in data
        assert "message" in data
        assert data["generation_type"] == "theory"
    
    def test_generation_types(self, client, api_prefix):
        """Test different generation types are accepted"""
        generation_types = ["theory", "lab_code", "explanation"]
        
        for gen_type in generation_types:
            request_data = {
                "prompt": "test prompt",
                "generation_type": gen_type
            }
            response = client.post(f"{api_prefix}/generation/generate", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["generation_type"] == gen_type
    
    def test_generation_validation(self, client, api_prefix):
        """Test Generation endpoint validates required fields"""
        # Missing required fields
        response = client.post(f"{api_prefix}/generation/generate", json={})
        
        assert response.status_code == 422  # Validation error
    
    def test_generation_invalid_type(self, client, api_prefix):
        """Test Generation endpoint rejects invalid generation type"""
        request_data = {
            "prompt": "test prompt",
            "generation_type": "invalid_type"
        }
        response = client.post(f"{api_prefix}/generation/generate", json=request_data)
        
        assert response.status_code == 422  # Validation error
