"""
Tests for RAG router endpoints
"""
import pytest


class TestRAGRouter:
    """Test suite for RAG router"""
    
    def test_rag_status_endpoint(self, client, api_prefix):
        """Test RAG status endpoint is accessible"""
        response = client.get(f"{api_prefix}/rag/status")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "message" in data
        assert data["status"] == "not_configured"
    
    def test_rag_retrieve_endpoint(self, client, api_prefix):
        """Test RAG retrieve endpoint is accessible"""
        request_data = {
            "query": "test query",
            "top_k": 5
        }
        response = client.post(f"{api_prefix}/rag/retrieve", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "query" in data
        assert "documents" in data
        assert "message" in data
        assert data["query"] == "test query"
        assert isinstance(data["documents"], list)
    
    def test_rag_retrieve_validation(self, client, api_prefix):
        """Test RAG retrieve endpoint validates required fields"""
        # Missing required 'query' field
        response = client.post(f"{api_prefix}/rag/retrieve", json={})
        
        assert response.status_code == 422  # Validation error
