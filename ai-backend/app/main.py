"""
FastAPI application entry point for AI Backend.

This service provides:
- Document upload and Q&A via Gemini API
- Theory and lab code generation
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import gemini_rag_routes, generation_router

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="AI Backend Service",
    description="AI service for document-based generation using Gemini",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify service status.

    Returns:
        dict: Service status and version information
    """
    return {
        "status": "healthy",
        "service": "ai-backend",
        "version": "1.0.0"
    }

# Include routers - Clean API structure
# Gemini RAG: Upload documents and ask questions
app.include_router(gemini_rag_routes.router,
                   prefix="/api/v1", tags=["Gemini RAG"])

# Generation: Create theory materials and lab exercises
app.include_router(generation_router.router,
                   prefix="/api/v1/generation", tags=["Generation"])

# Root endpoint


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint providing API information.

    Returns:
        dict: Welcome message and documentation link
    """
    return {
        "message": "AI Backend Service",
        "docs": "/docs",
        "health": "/health"
    }
