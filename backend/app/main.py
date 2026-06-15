import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

logger = logging.getLogger("moviepulse.main")


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    TMDB_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIM_EMAIL: str = ""
    PAYSTACK_SECRET_KEY: str = ""
    PAYSTACK_WEBHOOK_SECRET: str = ""
    CRON_SECRET: str = ""
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000","https://moviedrop.netlify.app","https://moviedrop.site","https://www.moviedrop.site"]'

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

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="MovieDrop API",
    version="1.0.0",
    docs_url=None,   # disable Swagger UI in production
    redoc_url=None,  # disable ReDoc in production
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


from app.api.router import api_router
app.include_router(api_router)


@app.get("/health", tags=["System"])
async def health_check():
    from datetime import datetime, timezone
    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tmdb_status": "configured" if settings.TMDB_API_KEY else "missing",
        "database_status": "configured" if settings.SUPABASE_URL else "missing_url",
    }


@app.get("/ping", tags=["System"])
async def ping():
    """Lightweight keep-alive endpoint. Hit every 10 min by cron to prevent Render cold starts."""
    return {"pong": True}
