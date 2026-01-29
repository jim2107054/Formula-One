"""
Development server startup script
Run this to start the AI backend service
"""
import uvicorn
from app.config import get_settings


def main():
    """Start the development server"""
    settings = get_settings()
    
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Environment: {settings.environment}")
    print(f"Listening on http://{settings.host}:{settings.port}")
    print(f"API docs: http://localhost:{settings.port}{settings.api_prefix}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )


if __name__ == "__main__":
    main()
