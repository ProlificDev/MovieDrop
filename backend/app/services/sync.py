import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Set
from supabase import create_client, Client
from app.services.tmdb import TMDBClient


# NOTE: Avoid importing app.main at module import time.
# Celery workers import tasks during startup; importing app.main
# pulls in API routers which can import SyncService again, creating a
# circular import and preventing the worker from starting.


def _get_settings():
    from app.main import settings  # lazy import
    return settings


logger = logging.getLogger("cinepulse.sync")

# All categories fetch movies from this year
SYNC_YEAR = 2025


class SyncService:

    def __init__(self):
        settings = _get_settings()
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")

        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        self.tmdb = TMDBClient(api_key=settings.TMDB_API_KEY)

    async def clear_all_movies(self) -> int:
        """
        Deletes every row in the movies table before a fresh sync.
        Returns the number of rows deleted.
        """
        try:
            response = self.supabase.table("movies").delete().gte("id", 0).execute()
            count = len(response.data) if response.data else 0
            logger.info(f"Cleared {count} existing movie records.")
            return count
        except Exception as e:
            logger.error(f"Failed to clear movies table: {e}")
            raise

    async def get_recently_synced_ids(self) -> Set[int]:
        """
        Returns IDs of movies already synced in the last 24 hours (for resumability).
        """
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            response = (
                self.supabase.table("movies")
                .select("id")
                .gte("updated_at", cutoff)
                .execute()
            )
            ids = {int(row["id"]) for row in response.data}
            logger.info(f"Resumability: {len(ids)} movies already synced in last 24h.")
            return ids
        except Exception as e:
            logger.error(f"Could not query recently synced IDs: {e}. Doing full sync.")
            return set()

    async def sync_pipeline(self, max_pages: int = 3, skip_recent: bool = True) -> Dict[str, Any]:
        """
        Full multi-category sync pipeline.
        Fetches SYNC_YEAR movies across all 4 categories from TMDB.

        Args:
            max_pages:    How many TMDB pages to fetch per category (20 movies/page).
            skip_recent:  If True, skip movies already synced in the last 24h.
                          Set to False after a clear_all_movies() call.
        """
        logger.info(f"Starting sync pipeline — year={SYNC_YEAR}, max_pages={max_pages}")

        # now-playing  → 2025 releases sorted by popularity (already out)
        # upcoming     → future release dates sorted by release date ascending
        CATEGORIES = {
            "now-playing": "now_playing",
            "upcoming":    "upcoming",
        }

        summary: Dict[str, Any] = {
            "status": "success",
            "sync_year": SYNC_YEAR,
            "total_fetched": 0,
            "processed": 0,
            "upserted": 0,
            "skipped": 0,
            "failed": 0,
            "by_category": {},
            "errors": [],
        }

        recently_synced = await self.get_recently_synced_ids() if skip_recent else set()

        for category_key in CATEGORIES:
            logger.info(f"\n{'='*50}\nCategory: {category_key}\n{'='*50}")
            cat = {"fetched": 0, "upserted": 0, "skipped": 0, "failed": 0}

            # ── Fetch paginated movie stubs from TMDB ──────────────────────
            movie_list = []
            page = 1
            total_pages = 1
            try:
                while page <= total_pages and page <= max_pages:
                    logger.info(f"  [{category_key}] Fetching page {page}")
                    if category_key == "now-playing":
                        # 2025 releases already out, sorted by popularity
                        data = await self.tmdb.get_discover_movies(page=page, year=SYNC_YEAR)
                    else:
                        # upcoming: future release dates, sorted by release date
                        data = await self.tmdb.get_upcoming_movies_filtered(page=page)
                    movie_list.extend(data.get("results", []))
                    total_pages = data.get("total_pages", 1)
                    page += 1

                cat["fetched"] = len(movie_list)
                summary["total_fetched"] += len(movie_list)
                logger.info(f"  [{category_key}] {len(movie_list)} stubs fetched.")
            except Exception as e:
                logger.error(f"  [{category_key}] Fetch failed: {e}")
                summary["errors"].append(f"{category_key} fetch: {e}")
                continue

            # ── Hydrate each movie and upsert ──────────────────────────────
            for stub in movie_list:
                movie_id = stub.get("id")
                if not movie_id:
                    continue

                summary["processed"] += 1

                if movie_id in recently_synced:
                    summary["skipped"] += 1
                    cat["skipped"] += 1
                    continue

                try:
                    logger.info(f"  [{category_key}] Hydrating {movie_id} '{stub.get('title')}'")
                    details = await self.tmdb.get_movie_details(movie_id)

                    trailer_url = self.tmdb.extract_youtube_trailer(details)
                    top_cast = self.tmdb.extract_top_cast(details, limit=5)

                    try:
                        watch_providers = await self.tmdb.get_watch_providers(movie_id)
                    except Exception:
                        watch_providers = {}

                    payload = {
                        "id": movie_id,
                        "title": details.get("title"),
                        "overview": details.get("overview"),
                        "release_date": details.get("release_date") or None,
                        "poster_path": details.get("poster_path"),
                        "backdrop_path": details.get("backdrop_path"),
                        "vote_average": round(float(details.get("vote_average") or 0.0), 1),
                        "genres": details.get("genres", []),
                        "trailer_url": trailer_url,
                        "cast": top_cast,
                        "popularity": float(details.get("popularity") or 0.0),
                        "runtime": details.get("runtime") or 0,
                        "category": category_key,
                        "watch_providers": watch_providers,
                    }

                    self.supabase.table("movies").upsert(payload).execute()
                    summary["upserted"] += 1
                    cat["upserted"] += 1
                    recently_synced.add(movie_id)
                    logger.info(f"  [{category_key}] ✓ Upserted {movie_id} '{details.get('title')}'")

                except Exception as e:
                    summary["failed"] += 1
                    cat["failed"] += 1
                    msg = f"[{category_key}] movie {movie_id}: {e}"
                    logger.error(f"  {msg}")
                    summary["errors"].append(msg)

            summary["by_category"][category_key] = cat

        logger.info(
            f"\nSync done — fetched={summary['total_fetched']} "
            f"upserted={summary['upserted']} "
            f"skipped={summary['skipped']} "
            f"failed={summary['failed']}"
        )
        return summary
