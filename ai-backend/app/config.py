"""
Configuration module for AI Backend service
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    app_name: str = "Formula One AI Backend"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"

    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # CORS Settings - Allow backend service to communicate
    cors_origins: list[str] = [
        "http://localhost:3000",  # Frontend
        "http://localhost:3001",  # Frontend alternative
        "http://localhost:4000",  # Backend service
        "http://localhost:8000",  # Self
    ]

    # Environment
    environment: str = "development"

    # OpenAI Settings (optional)
    openai_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in environment


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
