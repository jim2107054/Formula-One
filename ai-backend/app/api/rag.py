"""
RAG API Endpoints

Provides ingestion and search endpoints for the RAG system.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from app.rag.ingestion.service import ingest_text
from app.rag.retriever.service import query_rag

router = APIRouter()


# Pydantic Models
class IngestRequest(BaseModel):
    """Request model for document ingestion"""
    text: str = Field(..., description="Text content to ingest")
    metadata: Dict[str, Any] = Field(
        ...,
        description="Metadata for the document (e.g., {'source_id': 'doc_1', 'type': 'theory', 'week': 1})"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Binary search is an efficient algorithm that finds the position of a target value...",
                "metadata": {
                    "source_id": "week1_lecture1",
                    "type": "theory",
                    "week": 1
                }
            }
        }


class SearchRequest(BaseModel):
    """Request model for RAG search"""
    query: str = Field(..., description="Search query text")
    k: int = Field(4, description="Number of results to return", ge=1, le=20)

    class Config:
        json_schema_extra = {
            "example": {
                "query": "How does binary search work?",
                "k": 4
            }
        }


class IngestResponse(BaseModel):
    """Response model for ingestion"""
    status: str


class SearchResponse(BaseModel):
    """Response model for search"""
    results: List[Dict[str, Any]]


# Endpoints
@router.post("/ingest", response_model=IngestResponse, tags=["RAG"])
async def ingest_document(request: IngestRequest):
    """
    Ingest a document into the vector store.

    This endpoint chunks the text, creates embeddings, and stores them in ChromaDB
    with the provided metadata.

    Args:
        request: IngestRequest containing text and metadata

    Returns:
        IngestResponse with status "success" or "failed"

    Raises:
        HTTPException: If ingestion fails
    """
    try:
        success = ingest_text(
            content=request.text,
            metadata=request.metadata
        )

        if success:
            return IngestResponse(status="success")
        else:
            raise HTTPException(
                status_code=400,
                detail="Ingestion failed. Check logs for details."
            )
    except HTTPException:
        # Re-raise HTTPExceptions as-is (don't wrap them)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during ingestion: {str(e)}"
        )


@router.post("/search", response_model=SearchResponse, tags=["RAG"])
async def search_documents(request: SearchRequest):
    """
    Search for relevant documents using semantic search.

    This endpoint performs similarity search on the vector store and returns
    the most relevant document chunks.

    Args:
        request: SearchRequest containing query and k (number of results)

    Returns:
        SearchResponse with list of results, each containing:
        - content: The document text
        - metadata: Associated metadata (source_id, type, week, etc.)

    Raises:
        HTTPException: If search fails
    """
    try:
        results = query_rag(
            query_text=request.query,
            k=request.k
        )

        return SearchResponse(results=results)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during search: {str(e)}"
        )
