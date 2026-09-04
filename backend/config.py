"""
AeroSmog.AI — Application Configuration
Loads settings from .env file via pydantic-settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    app_name: str = "AeroSmog.AI"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./aerosmog.db"

    # External APIs
    waqi_api_key: str = "demo"          # WAQI AQI API token
    groq_api_key: str = ""              # Groq LLM API key
    gemini_api_key: str = ""            # Gemini fallback

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
