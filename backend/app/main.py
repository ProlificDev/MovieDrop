import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """
    Application environment configurations loader.
    Auto-parses properties from system env or local .env file.
    """
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    TMDB_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    REDIS_URL: str = ""
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIM_EMAIL: str = ""
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000"]'

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except Exception:
            return ["http://localhost:3000"]

settings = Settings()

app = FastAPI(
    title="MoviePulse API",
    description="Asynchronous Movie Watchlist & Release Notification Engine",
    version="1.0.0"
)

# Apply CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Central Router mapping versioned API routes
from app.api.router import api_router
app.include_router(api_router)

@app.get("/health", tags=["System"])
async def health_check():
    """
    Simple system check endpoint for deployment monitoring.
    """
    return {
        "status": "online",
        "service": "MoviePulse Backend REST Engine",
        "version": "1.0.0",
        "tmdb_status": "configured" if settings.TMDB_API_KEY else "missing_key",
        "database_status": "configured" if settings.SUPABASE_URL else "missing_url"
    }
