import logging
from uuid import UUID
from typing import Optional
from supabase import create_client, Client

logger = logging.getLogger("moviepulse.subscriptions")


class SubscriptionService:

    def __init__(self):
        from app.main import settings
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("Supabase credentials are required.")
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )

    async def subscribe(
        self,
        anonymous_id: UUID,
        movie_id: int,
        notify_days_before: list[int],
        plan: str,
        email: Optional[str] = None,
        push_subscription: Optional[dict] = None,
    ) -> dict:
        payload = {
            "anonymous_id": str(anonymous_id),
            "movie_id": movie_id,
            "notify_days_before": notify_days_before,
            "plan": plan,
            "email": email,
            "push_subscription": push_subscription,
        }
        response = (
            self.supabase.table("guest_subscriptions")
            .upsert(payload, on_conflict="anonymous_id,movie_id")
            .execute()
        )
        logger.info(f"Subscribed {anonymous_id} to movie {movie_id}")
        return response.data[0] if response.data else payload

    async def unsubscribe(self, anonymous_id: UUID, movie_id: int) -> bool:
        self.supabase.table("guest_subscriptions") \
            .delete() \
            .eq("anonymous_id", str(anonymous_id)) \
            .eq("movie_id", movie_id) \
            .execute()
        logger.info(f"Unsubscribed {anonymous_id} from movie {movie_id}")
        return True

    async def get_subscription(self, anonymous_id: UUID, movie_id: int) -> Optional[dict]:
        response = (
            self.supabase.table("guest_subscriptions")
            .select("*")
            .eq("anonymous_id", str(anonymous_id))
            .eq("movie_id", movie_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    async def get_all_subscriptions(self, anonymous_id: UUID) -> list[dict]:
        response = (
            self.supabase.table("guest_subscriptions")
            .select("*, movies(id, title, release_date, poster_path)")
            .eq("anonymous_id", str(anonymous_id))
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    async def count_subscriptions(self, anonymous_id: UUID) -> int:
        response = (
            self.supabase.table("guest_subscriptions")
            .select("id", count="exact")
            .eq("anonymous_id", str(anonymous_id))
            .execute()
        )
        return response.count or 0

    async def get_subscriptions_for_dates(self, dates: list[str]) -> list[dict]:
        """
        Returns all subscriptions where the movie's release_date is in the given list.
        More efficient than calling get_due_subscriptions once per date.
        """
        response = (
            self.supabase.table("guest_subscriptions")
            .select("*, movies(id, title, release_date, poster_path, overview)")
            .in_("movies.release_date", dates)
            .execute()
        )
        rows = response.data or []
        return [r for r in rows if r.get("movies")]

    async def get_due_subscriptions(self, target_date: str) -> list[dict]:
        """
        Returns all subscriptions where the movie's release_date matches target_date.
        Used by the daily notification scheduler.
        """
        response = (
            self.supabase.table("guest_subscriptions")
            .select("*, movies(id, title, release_date, poster_path, overview)")
            .eq("movies.release_date", target_date)
            .execute()
        )
        rows = response.data or []
        # Filter out rows where the join returned no matching movie
        return [r for r in rows if r.get("movies")]

    async def log_notification(
        self,
        anonymous_id: str,
        movie_id: int,
        channel: str,
        days_before: int,
        status: str,
        error_message: Optional[str] = None,
    ) -> None:
        self.supabase.table("guest_notifications_log").insert({
            "anonymous_id": anonymous_id,
            "movie_id": movie_id,
            "channel": channel,
            "days_before": days_before,
            "status": status,
            "error_message": error_message,
        }).execute()
