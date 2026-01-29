"""
FastAPI Application Entry Point for Formula One AI Backend
Provides RAG, Generation, and Validation services
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.api import health, rag, generation, validation

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting AI Backend service...")
    settings = get_settings()
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Version: {settings.app_version}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Backend service...")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    """
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI Backend service for Formula One learning platform",
        docs_url=f"{settings.api_prefix}/docs",
        redoc_url=f"{settings.api_prefix}/redoc",
        openapi_url=f"{settings.api_prefix}/openapi.json",
        lifespan=lifespan
    )
    
    # Configure CORS for backend communication
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(rag.router, prefix=settings.api_prefix)
    app.include_router(generation.router, prefix=settings.api_prefix)
    app.include_router(validation.router, prefix=settings.api_prefix)
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint with service information"""
        return JSONResponse({
            "service": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "docs": f"{settings.api_prefix}/docs"
        })
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
