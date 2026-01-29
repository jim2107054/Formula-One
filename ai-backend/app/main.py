"""
FastAPI application entry point for AI Backend.

This service is sandboxed and stateless, providing:
- RAG-based retrieval over course materials
- Theory and lab code generation
- Validation of AI outputs
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import rag_router, generation_router, validation_router, rag, gemini_rag_routes
from app.api.gemini_rag_routes import router as gemini_rag_router

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="AI Backend Service",
    description="Sandboxed AI service for RAG, generation, and validation",
    version="0.1.0"
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
        "version": "0.1.0"
    }

# Include routers
app.include_router(rag.router, prefix="/rag", tags=["RAG"])
app.include_router(gemini_rag_routes.router,
                   prefix="/gemini", tags=["Gemini RAG"])
app.include_router(gemini_rag_router, prefix="/api/v1", tags=["Gemini RAG"])
app.include_router(rag_router.router, prefix="/rag-info", tags=["RAG Info"])
app.include_router(generation_router.router,
                   prefix="/generation", tags=["Generation"])
app.include_router(validation_router.router,
                   prefix="/validation", tags=["Validation"])

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
