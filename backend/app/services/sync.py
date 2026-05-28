import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Set, List
from supabase import create_client, Client
from app.main import settings
from app.services.tmdb import TMDBClient

logger = logging.getLogger("cinepulse.sync")

class SyncService:
    """
    Service responsible for executing the movie pipeline: fetching upcoming films from TMDB, 
    hydrating cast/trailer information, and upserting the parsed records into Supabase.
    """
    def __init__(self):
        # Verify database variables are available
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.")
        
        # Instantiate Supabase Client using the service role key to bypass RLS policies
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        # Instantiate TMDB API client
        self.tmdb = TMDBClient(api_key=settings.TMDB_API_KEY)

    async def get_recently_synced_ids(self) -> Set[int]:
        """
        Queries the database to find which movie records were already successfully 
        upserted/updated in the last 24 hours. Helps make the job resumable and network-efficient.
        """
        try:
            # 24 hours ago timestamp formatted in ISO-8601
            cutoff_time = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            
            # Select IDs of movies modified after the cutoff time
            response = self.supabase.table("movies") \
                .select("id") \
                .gte("updated_at", cutoff_time) \
                .execute()
                
            synced_ids = {int(row["id"]) for row in response.data}
            logger.info(f"Resumability check: Found {len(synced_ids)} movies already synced within the last 24 hours.")
            return synced_ids
        except Exception as e:
            logger.error(f"Error querying recently synced movies: {str(e)}. Proceeding with full sync.")
            return set()

    async def sync_pipeline(self, max_pages: int = 3) -> Dict[str, Any]:
        """
        Executes the full multi-category synchronization pipeline.
        Fetches movies from all 4 TMDB endpoints: upcoming, now_playing, popular, top_rated.
        """
        logger.info("Initializing Multi-Category Movie Sync Pipeline...")

        # Categories mapped to their TMDB endpoint names
        CATEGORIES = {
            "upcoming": "upcoming",
            "now-playing": "now_playing",
            "popular": "popular",
            "top-rated": "top_rated",
        }
        
        summary = {
            "status": "success",
            "total_fetched": 0,
            "processed": 0,
            "upserted": 0,
            "skipped": 0,
            "failed": 0,
            "by_category": {},
            "errors": []
        }

        # 1. Fetch recently synced movies to facilitate job resumability
        recently_synced = await self.get_recently_synced_ids()

        for category_key, tmdb_endpoint in CATEGORIES.items():
            logger.info(f"\n{'='*50}")
            logger.info(f"Syncing category: {category_key} (TMDB endpoint: /movie/{tmdb_endpoint})")
            logger.info(f"{'='*50}")

            cat_summary = {"fetched": 0, "upserted": 0, "skipped": 0, "failed": 0}

            # 2. Gather paginated movie list from TMDB for this category
            movie_list = []
            current_page = 1
            total_pages = 1

            try:
                while current_page <= total_pages and current_page <= max_pages:
                    logger.info(f"  [{category_key}] Page {current_page}/{min(total_pages, max_pages)}")
                    
                    # Use discover endpoint with year filter for ALL categories
                    # to guarantee movies have had time to reach streaming services
                    if tmdb_endpoint in ("now_playing", "popular"):
                        data = await self.tmdb.get_discover_movies(page=current_page, year=2023)
                    else:  # upcoming, top_rated
                        data = await self.tmdb.get_discover_movies(page=current_page, year=2024)
                    
                    results = data.get("results", [])
                    movie_list.extend(results)
                    
                    total_pages = data.get("total_pages", 1)
                    current_page += 1
                
                cat_summary["fetched"] = len(movie_list)
                summary["total_fetched"] += len(movie_list)
                logger.info(f"  [{category_key}] Fetched {len(movie_list)} movie stubs.")
            except Exception as e:
                logger.error(f"  [{category_key}] Failed to fetch movie list: {str(e)}")
                summary["errors"].append(f"{category_key} fetch error: {str(e)}")
                continue

            # 3. Iterate through movies, hydrate details, and upsert with category tag
            for movie_stub in movie_list:
                movie_id = movie_stub.get("id")
                if not movie_id:
                    continue

                summary["processed"] += 1

                # Skip if already synced recently
                if movie_id in recently_synced:
                    summary["skipped"] += 1
                    cat_summary["skipped"] += 1
                    continue

                try:
                    logger.info(f"  [{category_key}] Hydrating movie ID {movie_id} ('{movie_stub.get('title')}')")
                    details = await self.tmdb.get_movie_details(movie_id)

                    trailer_url = self.tmdb.extract_youtube_trailer(details)
                    top_cast = self.tmdb.extract_top_cast(details, limit=5)

                    release_date = details.get("release_date") or None
                    payload = {
                        "id": movie_id,
                        "title": details.get("title"),
                        "overview": details.get("overview"),
                        "release_date": release_date,
                        "poster_path": details.get("poster_path"),
                        "backdrop_path": details.get("backdrop_path"),
                        "vote_average": round(float(details.get("vote_average", 0.0)), 1) if details.get("vote_average") is not None else 0.0,
                        "genres": details.get("genres", []),
                        "trailer_url": trailer_url,
                        "cast": top_cast,
                        "popularity": float(details.get("popularity", 0.0)),
                        "category": category_key,
                    }

                    self.supabase.table("movies").upsert(payload).execute()
                    summary["upserted"] += 1
                    cat_summary["upserted"] += 1
                    recently_synced.add(movie_id)  # prevent re-processing across categories
                    logger.info(f"  [{category_key}] Upserted movie ID {movie_id} - '{details.get('title')}'")

                except Exception as e:
                    summary["failed"] += 1
                    cat_summary["failed"] += 1
                    err_msg = f"[{category_key}] Sync failed for movie ID {movie_id}: {str(e)}"
                    logger.error(f"  {err_msg}")
                    summary["errors"].append(err_msg)

            summary["by_category"][category_key] = cat_summary

        logger.info(
            f"\nMulti-Category Sync Pipeline Completed. "
            f"Total Fetched: {summary['total_fetched']} | "
            f"Processed: {summary['processed']} | "
            f"Upserted: {summary['upserted']} | "
            f"Skipped: {summary['skipped']} | "
            f"Failed: {summary['failed']}"
        )
        return summary

