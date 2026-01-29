"""
FastAPI application entry point for AI Backend.

This service provides:
- Smart Agent with intent classification and persistent memory
- Document upload and Q&A via Gemini API
- Theory and lab code generation
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import gemini_rag_routes, generation_router, smart_agent, validation

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="AI Backend Service",
    description="Smart AI agent with persistent memory and intelligent routing",
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
# Smart Agent: Intelligent routing with persistent memory (PRIMARY)
app.include_router(smart_agent.router,
                   prefix="/api/v1/agent", tags=["Smart Agent"])

# Gemini RAG: Direct upload and ask (for manual control)
app.include_router(gemini_rag_routes.router,
                   prefix="/api/v1", tags=["Gemini RAG"])

# Generation: Direct theory/lab generation (for manual control)
app.include_router(generation_router.router,
                   prefix="/api/v1/generation", tags=["Generation"])

# Validation: Code validation and AI review
app.include_router(validation.router,
                   prefix="/api/v1", tags=["Validation"])

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
