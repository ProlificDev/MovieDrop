import asyncio
import logging
from datetime import datetime, timedelta, timezone
from app.tasks.celery_app import celery_app


from app.services.sync import SyncService
from app.services.subscriptions import SubscriptionService
from app.services.notifications import NotificationService

logger = logging.getLogger("moviepulse.scheduler")


def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


@celery_app.task(bind=True, name="app.tasks.scheduler.sync_upcoming_movies")
def sync_upcoming_movies(self, max_pages: int = 3, skip_recent: bool = True):
    logger.info(f"[Task {self.request.id}] Starting sync_upcoming_movies task...")
    try:
        sync_service = SyncService()
        result = run_async(sync_service.sync_pipeline(max_pages=max_pages, skip_recent=skip_recent))
        logger.info(f"[Task {self.request.id}] Sync completed: {result.get('status')}")
        return result
    except Exception as e:
        logger.error(f"[Task {self.request.id}] Sync task failed: {e}", exc_info=True)
        return {"status": "failed", "error": str(e)}


@celery_app.task(bind=True, name="app.tasks.scheduler.send_notifications")
def send_notifications(self):
    """
    Daily task: for each notify_days_before offset, find subscriptions
    whose movie releases on that target date and fire email + push.
    """
    logger.info(f"[Task {self.request.id}] Starting send_notifications task...")
    return run_async(_send_notifications_async())


async def _send_notifications_async():
    svc = SubscriptionService()
    notif = NotificationService()
    today = datetime.now(timezone.utc).date()

    # Check offsets 0–30 days ahead
    all_offsets = list(range(0, 31))
    sent = failed = 0

    for days_before in all_offsets:
        target_date = (today + timedelta(days=days_before)).isoformat()
        subscriptions = await svc.get_due_subscriptions(target_date)

        for sub in subscriptions:
            # Only fire if this days_before is in the subscriber's chosen offsets
            if days_before not in sub.get("notify_days_before", []):
                continue

            movie = sub.get("movies", {})
            movie_id = sub["movie_id"]
            anon_id = sub["anonymous_id"]

            # Email
            if sub.get("email"):
                try:
                    await notif.send_email(
                        to_email=sub["email"],
                        movie_title=movie.get("title", "Unknown"),
                        release_date=target_date,
                        days_before=days_before,
                        movie_id=movie_id,
                        poster_path=movie.get("poster_path"),
                    )
                    await svc.log_notification(anon_id, movie_id, "email", days_before, "sent")
                    sent += 1
                except Exception as e:
                    await svc.log_notification(anon_id, movie_id, "email", days_before, "failed", str(e))
                    failed += 1

            # Push notifications removed per request.
            # (Only email is sent.)



    logger.info(f"Notifications done — sent={sent} failed={failed}")
    return {"status": "success", "sent": sent, "failed": failed}
