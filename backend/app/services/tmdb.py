import httpx
import logging
from typing import Dict, Any, List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger("cinepulse.tmdb")

class TMDBClient:
    """
    Asynchronous client interface to handle incoming movie queries from TMDB.
    Built with auto-retry resilience for rate-limits and network timeouts.
    """
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("TMDB_API_KEY environment variable is required to instantiate TMDBClient.")
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        self.headers = {
            "accept": "application/json",
        }

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def get_upcoming_movies(self, page: int = 1, region: str = "US") -> Dict[str, Any]:
        """
        Query upcoming theatrical movies (paginated).
        Automatically retries on rate limits (429) or network issues.
        """
        url = f"{self.base_url}/movie/upcoming"
        params = {
            "api_key": self.api_key,
            "language": "en-US",
            "page": page,
            "region": region
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def get_movie_details(self, movie_id: int) -> Dict[str, Any]:
        """
        Retrieve complete details for a single film, hydrates cast credits 
        and trailer video configurations in a single asynchronous call.
        """
        url = f"{self.base_url}/movie/{movie_id}"
        params = {
            "api_key": self.api_key,
            "language": "en-US",
            "append_to_response": "credits,videos"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()

    def extract_youtube_trailer(self, details_payload: Dict[str, Any]) -> Optional[str]:
        """
        Parses the nested videos dictionary to find a YouTube trailer.
        Falls back to any YouTube video key if a dedicated 'Trailer' is not present.
        """
        videos = details_payload.get("videos", {}).get("results", [])
        if not videos:
            return None

        # Attempt 1: Filter for a YouTube video tagged exactly as "Trailer"
        for video in videos:
            if video.get("site") == "YouTube" and video.get("type") == "Trailer":
                key = video.get("key")
                if key:
                    return f"https://www.youtube.com/watch?v={key}"

        # Attempt 2: Fall back to any active YouTube video key (e.g. Teaser, Clip)
        for video in videos:
            if video.get("site") == "YouTube":
                key = video.get("key")
                if key:
                    return f"https://www.youtube.com/watch?v={key}"
        
        return None

    def extract_top_cast(self, details_payload: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
        """
        Extracts up to 'limit' billed actors from credits, 
        returning only required compact properties.
        """
        cast_members = details_payload.get("credits", {}).get("cast", [])
        top_cast = []
        
        # Pull only relevant billing details to optimize Postgres jsonb cell footprint
        for actor in cast_members[:limit]:
            top_cast.append({
                "id": actor.get("id"),
                "name": actor.get("name"),
                "character": actor.get("character"),
                "profile_path": actor.get("profile_path")
            })
            
        return top_cast
