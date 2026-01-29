"""
RAG Router

Handles retrieval-augmented generation endpoints for course materials.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def rag_root():
    """
    RAG router root endpoint.

    Returns:
        dict: RAG service information
    """
    return {
        "service": "rag",
        "description": "Retrieval-Augmented Generation endpoints",
        "status": "ready"
    }


# Placeholder for future RAG endpoints:
# - Document ingestion
# - Vector search
# - Retrieval queries
