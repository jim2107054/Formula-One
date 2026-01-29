"""
Gemini RAG API Routes

Provides document upload and question answering endpoints using Google's Gemini API.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.gemini_rag.service import get_gemini_service

router = APIRouter()


# Pydantic Models
class AskRequest(BaseModel):
    """Request model for asking questions"""
    query: str = Field(...,
                       description="Question to ask based on uploaded documents")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is the time complexity of binary search?"
            }
        }


class AskResponse(BaseModel):
    """Response model for question answering"""
    answer: str = Field(..., description="Generated answer from Gemini")


class UploadResponse(BaseModel):
    """Response model for document upload"""
    status: str = Field(..., description="Upload status")
    filename: str = Field(..., description="Name of the uploaded file")
    uri: str = Field(..., description="URI of the uploaded file in Gemini")


# Endpoints
@router.post("/upload", response_model=UploadResponse, tags=["Gemini RAG"])
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document to Gemini for RAG context.

    This endpoint accepts PDF, text, or other supported file formats and uploads
    them to Gemini's file API for use in question answering.

    Args:
        file: The file to upload (PDF, TXT, HTML, JSON, MD, etc.)

    Returns:
        UploadResponse with status, filename, and URI

    Raises:
        HTTPException: If upload fails
    """
    try:
        # Read file bytes
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        # Determine MIME type from file extension
        mime_type = _get_mime_type(file.filename or "file.bin")

        # Get service and upload to Gemini
        service = get_gemini_service()
        result = await service.upload_document(
            file_content=file_content,
            mime_type=mime_type
        )

        return UploadResponse(
            status="success",
            filename=result["filename"],
            uri=result["uri"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.post("/ask", response_model=AskResponse, tags=["Gemini RAG"])
async def ask_question(request: AskRequest):
    """
    Ask a question based on uploaded documents.

    This endpoint uses Gemini's RAG capabilities to answer questions using
    the context from previously uploaded documents.

    Args:
        request: AskRequest containing the query

    Returns:
        AskResponse with the generated answer

    Raises:
        HTTPException: If question answering fails or no documents uploaded
    """
    try:
        # Get service and ask the question
        service = get_gemini_service()
        answer = await service.ask_question(request.query)

        return AskResponse(answer=answer)

    except HTTPException:
        raise
    except Exception as e:
        # Check if it's a "no documents uploaded" error
        if "No documents uploaded" in str(e):
            raise HTTPException(
                status_code=400,
                detail="No documents have been uploaded. Please upload at least one document before asking questions."
            )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(e)}"
        )


def _get_mime_type(filename: str) -> str:
    """
    Get MIME type from filename extension.

    Args:
        filename: Name of the file

    Returns:
        str: MIME type
    """
    extension = filename.lower().split('.')[-1] if '.' in filename else ''

    mime_types = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'html': 'text/html',
        'htm': 'text/html',
        'json': 'application/json',
        'md': 'text/markdown',
        'markdown': 'text/markdown',
    }

    return mime_types.get(extension, 'application/octet-stream')
