"""
Standalone script to trigger the TMDB -> Supabase movie synchronization pipeline.
Run from the backend/ directory:
    .\\venv\\Scripts\\python run_sync.py
"""
import asyncio
import sys
import os
import logging

# ── Ensure backend root is on sys.path ──────────────────────────────────────
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# ── Bootstrap settings WITHOUT importing app.main (avoids circular imports) ─
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    TMDB_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    REDIS_URL: str = ""
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIM_EMAIL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Patch settings into the app.main namespace before importing SyncService
import types
fake_main = types.ModuleType("app.main")
settings = Settings()
fake_main.settings = settings
sys.modules["app.main"] = fake_main

# ── Now import the real sync service ────────────────────────────────────────
from app.services.sync import SyncService  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

async def main():
    print("=" * 60)
    print("  MoviePulse - TMDB -> Supabase Sync Pipeline")
    print("=" * 60)

    if not settings.SUPABASE_URL:
        print("\n[ERROR] SUPABASE_URL not set in backend/.env", file=sys.stderr)
        sys.exit(1)
    if not settings.TMDB_API_KEY:
        print("\n[ERROR] TMDB_API_KEY not set in backend/.env", file=sys.stderr)
        sys.exit(1)

    try:
        service = SyncService()
        print("\nConnected. Starting pipeline (max_pages=3) …\n")
        result = await service.sync_pipeline(max_pages=3)

        print("\n" + "=" * 60)
        print("  Sync Complete!")
        print("=" * 60)
        for key, value in result.items():
            if key != "errors":
                print(f"  {key:<20}: {value}")
        if result.get("errors"):
            print(f"\n  Errors ({len(result['errors'])}):")
            for err in result["errors"]:
                print(f"    - {err}")
    except Exception as e:
        print(f"\n[FATAL] Sync failed: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
