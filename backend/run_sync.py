"""
Standalone script to clear old movies and run a fresh 2025 sync.

Usage (from backend/ directory):
    .\\venv\\Scripts\\python run_sync.py
"""
import asyncio
import sys
import os
import logging

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

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
        extra="ignore",
    )

# Patch settings into app.main namespace before importing SyncService
import types
fake_main = types.ModuleType("app.main")
settings = Settings()
fake_main.settings = settings
sys.modules["app.main"] = fake_main

from app.services.sync import SyncService, SYNC_YEAR  # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


async def main():
    print("=" * 60)
    print(f"  MoviePulse — Fresh {SYNC_YEAR} Sync")
    print("=" * 60)

    if not settings.SUPABASE_URL:
        print("\n[ERROR] SUPABASE_URL not set in backend/.env", file=sys.stderr)
        sys.exit(1)
    if not settings.TMDB_API_KEY:
        print("\n[ERROR] TMDB_API_KEY not set in backend/.env", file=sys.stderr)
        sys.exit(1)

    try:
        service = SyncService()

        # Step 1 — wipe all existing movies
        print("\n[1/2] Clearing old movies from database...")
        deleted = await service.clear_all_movies()
        print(f"      Deleted {deleted} rows.\n")

        # Step 2 — fresh sync with skip_recent=False (no 24h skip after a clear)
        print(f"[2/2] Fetching {SYNC_YEAR} movies (max_pages=3 per category)...\n")
        result = await service.sync_pipeline(max_pages=3, skip_recent=False)

        print("\n" + "=" * 60)
        print("  Sync Complete!")
        print("=" * 60)
        for key, value in result.items():
            if key not in ("errors", "by_category"):
                print(f"  {key:<20}: {value}")
        print("\n  By category:")
        for cat, stats in result.get("by_category", {}).items():
            print(f"    {cat:<15}: {stats}")
        if result.get("errors"):
            print(f"\n  Errors ({len(result['errors'])}):")
            for err in result["errors"][:10]:
                print(f"    - {err}")

    except Exception as e:
        print(f"\n[FATAL] Sync failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
