import logging
from typing import List
from uuid import UUID
from supabase import create_client, Client

logger = logging.getLogger("cinepulse.watchlist")


class WatchlistService:
    """
    Service for managing user movie watchlists.
    Handles CRUD operations for watchlist items.
    """

    def __init__(self):
        from app.main import settings
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")

        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )

    async def get_user_watchlist(self, user_id: UUID) -> List[dict]:
        """
        Fetch all movies in a user's watchlist.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            List of watchlist entries with joined movie details
        """
        try:
            response = (
                self.supabase.table("watchlists")
                .select("id, movie_id, created_at, movies(id, title, overview, release_date, poster_path, genres)")
                .eq("user_id", str(user_id))
                .order("created_at", desc=True)
                .execute()
            )
            logger.info(f"Retrieved {len(response.data)} movies from watchlist for user {user_id}")
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch watchlist for user {user_id}: {e}")
            raise

    async def add_to_watchlist(self, user_id: UUID, movie_id: int) -> dict:
        """
        Add a movie to user's watchlist.
        
        Args:
            user_id: UUID of the user
            movie_id: TMDB movie ID
            
        Returns:
            Watchlist entry that was created
        """
        try:
            payload = {
                "user_id": str(user_id),
                "movie_id": movie_id
            }
            response = self.supabase.table("watchlists").upsert(payload).execute()
            logger.info(f"Added movie {movie_id} to watchlist for user {user_id}")
            return response.data[0] if response.data else payload
        except Exception as e:
            logger.error(f"Failed to add movie {movie_id} to watchlist for user {user_id}: {e}")
            raise

    async def remove_from_watchlist(self, user_id: UUID, movie_id: int) -> bool:
        """
        Remove a movie from user's watchlist.
        
        Args:
            user_id: UUID of the user
            movie_id: TMDB movie ID
            
        Returns:
            True if successful
        """
        try:
            response = (
                self.supabase.table("watchlists")
                .delete()
                .eq("user_id", str(user_id))
                .eq("movie_id", movie_id)
                .execute()
            )
            logger.info(f"Removed movie {movie_id} from watchlist for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to remove movie {movie_id} from watchlist for user {user_id}: {e}")
            raise

    async def is_in_watchlist(self, user_id: UUID, movie_id: int) -> bool:
        """
        Check if a movie is in user's watchlist.
        
        Args:
            user_id: UUID of the user
            movie_id: TMDB movie ID
            
        Returns:
            True if movie is in watchlist, False otherwise
        """
        try:
            response = (
                self.supabase.table("watchlists")
                .select("id")
                .eq("user_id", str(user_id))
                .eq("movie_id", movie_id)
                .execute()
            )
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to check if movie {movie_id} is in watchlist for user {user_id}: {e}")
            raise

    async def get_watchlist_count(self, user_id: UUID) -> int:
        """
        Get total number of movies in user's watchlist.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Count of movies in watchlist
        """
        try:
            response = (
                self.supabase.table("watchlists")
                .select("id", count="exact")
                .eq("user_id", str(user_id))
                .execute()
            )
            count = response.count or 0
            logger.info(f"User {user_id} has {count} movies in watchlist")
            return count
        except Exception as e:
            logger.error(f"Failed to get watchlist count for user {user_id}: {e}")
            raise
