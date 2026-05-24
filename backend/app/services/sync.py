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

    async def sync_pipeline(self, max_pages: int = 5) -> Dict[str, Any]:
        """
        Executes the main synchronization pipeline.
        Fetches upcoming releases, hydration details, and updates the cache.
        """
        logger.info("Initializing Movie Data Sync Pipeline...")
        
        summary = {
            "status": "success",
            "upcoming_fetched": 0,
            "processed": 0,
            "upserted": 0,
            "skipped": 0,
            "failed": 0,
            "errors": []
        }

        # 1. Fetch recently synced movies to facilitate job resumability
        recently_synced = await self.get_recently_synced_ids()

        # 2. Gather paginated upcoming movies list from TMDB
        upcoming_movie_list = []
        current_page = 1
        total_pages = 1

        try:
            while current_page <= total_pages and current_page <= max_pages:
                logger.info(f"Querying upcoming movies from TMDB - Page {current_page} of {total_pages}")
                data = await self.tmdb.get_upcoming_movies(page=current_page)
                
                results = data.get("results", [])
                upcoming_movie_list.extend(results)
                
                total_pages = data.get("total_pages", 1)
                current_page += 1
            
            summary["upcoming_fetched"] = len(upcoming_movie_list)
            logger.info(f"Fetched total of {len(upcoming_movie_list)} upcoming movie stubs from TMDB.")
        except Exception as e:
            logger.error(f"Failed to fetch upcoming movies list: {str(e)}")
            summary["status"] = "failed"
            summary["errors"].append(f"Upcoming fetch error: {str(e)}")
            return summary

        # 3. Iterate through movies, hydrate details, and upsert
        for movie_stub in upcoming_movie_list:
            movie_id = movie_stub.get("id")
            if not movie_id:
                continue

            summary["processed"] += 1

            # Check if this movie has already been processed in the last 24h
            if movie_id in recently_synced:
                summary["skipped"] += 1
                logger.debug(f"Skipping movie ID {movie_id} - already successfully synced recently.")
                continue

            try:
                logger.info(f"Hydrating details for movie ID {movie_id} ('{movie_stub.get('title')}')")
                # Hydrate cast credits and trailer paths in a single roundtrip call
                details = await self.tmdb.get_movie_details(movie_id)

                # Extract trailers and billing cast details
                trailer_url = self.tmdb.extract_youtube_trailer(details)
                top_cast = self.tmdb.extract_top_cast(details, limit=5)

                # Assemble database payload, mapping keys to Supabase columns
                payload = {
                    "id": movie_id,
                    "title": details.get("title"),
                    "overview": details.get("overview"),
                    "release_date": details.get("release_date"),
                    "poster_path": details.get("poster_path"),
                    "backdrop_path": details.get("backdrop_path"),
                    "vote_average": round(float(details.get("vote_average", 0.0)), 1) if details.get("vote_average") is not None else 0.0,
                    "genres": details.get("genres", []),
                    "trailer_url": trailer_url,
                    "cast": top_cast,
                    "popularity": float(details.get("popularity", 0.0))
                }

                # Upsert record into Supabase
                self.supabase.table("movies").upsert(payload).execute()
                summary["upserted"] += 1
                logger.info(f"Successfully upserted movie ID {movie_id} - '{details.get('title')}'")

            except Exception as e:
                summary["failed"] += 1
                err_msg = f"Sync failed for movie ID {movie_id}: {str(e)}"
                logger.error(err_msg)
                summary["errors"].append(err_msg)
                # Resumability feature: We catch errors here and continue. The loop is resilient, 
                # meaning a crash in one movie details query does not corrupt the entire job run.

        logger.info(
            f"Movie Sync Pipeline Completed. "
            f"Processed: {summary['processed']} | "
            f"Upserted: {summary['upserted']} | "
            f"Skipped: {summary['skipped']} | "
            f"Failed: {summary['failed']}"
        )
        return summary
