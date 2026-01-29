"""
Configuration module for AI Backend service
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    app_name: str = "Formula One AI Backend"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = True
    
    # CORS Settings - Allow backend service to communicate
    cors_origins: list[str] = [
        "http://localhost:3000",  # Backend service
        "http://localhost:3001",  # Frontend
        "http://localhost:8001",  # Self
    ]
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
