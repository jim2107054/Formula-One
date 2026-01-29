"""
Tests for Validation router endpoints
"""
import pytest


class TestValidationRouter:
    """Test suite for Validation router"""
    
    def test_validation_status_endpoint(self, client, api_prefix):
        """Test Validation status endpoint is accessible"""
        response = client.get(f"{api_prefix}/validation/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "message" in data
        assert "validators" in data
        assert data["status"] == "not_configured"
    
    def test_validation_validate_endpoint(self, client, api_prefix):
        """Test Validation validate endpoint is accessible"""
        request_data = {
            "content": "test content",
            "validation_type": "code"
        }
        response = client.post(f"{api_prefix}/validation/validate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "validation_type" in data
        assert "result" in data
        assert "message" in data
        assert data["validation_type"] == "code"
    
    def test_validation_types(self, client, api_prefix):
        """Test different validation types are accepted"""
        validation_types = ["code", "grounding", "rubric"]
        
        for val_type in validation_types:
            request_data = {
                "content": "test content",
                "validation_type": val_type
            }
            response = client.post(f"{api_prefix}/validation/validate", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["validation_type"] == val_type
    
    def test_validation_result_structure(self, client, api_prefix):
        """Test validation result has correct structure"""
        request_data = {
            "content": "test content",
            "validation_type": "code"
        }
        response = client.post(f"{api_prefix}/validation/validate", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        result = data["result"]
        
        assert "valid" in result
        assert "issues" in result
        assert "suggestions" in result
        assert isinstance(result["valid"], bool)
        assert isinstance(result["issues"], list)
        assert isinstance(result["suggestions"], list)
    
    def test_validation_endpoint_validation(self, client, api_prefix):
        """Test Validation endpoint validates required fields"""
        # Missing required fields
        response = client.post(f"{api_prefix}/validation/validate", json={})
        
        assert response.status_code == 422  # Validation error
    
    def test_validation_invalid_type(self, client, api_prefix):
        """Test Validation endpoint rejects invalid validation type"""
        request_data = {
            "content": "test content",
            "validation_type": "invalid_type"
        }
        response = client.post(f"{api_prefix}/validation/validate", json=request_data)
        
        assert response.status_code == 422  # Validation error
