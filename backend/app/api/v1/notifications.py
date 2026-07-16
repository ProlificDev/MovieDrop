import logging
from fastapi import APIRouter, Header, HTTPException, Request
from app.services.subscriptions import SubscriptionService
from app.services.notifications import NotificationService
from datetime import datetime, timedelta, timezone
from app.main import settings

logger = logging.getLogger("moviedrop.api.notifications")
router = APIRouter(prefix="/notifications", tags=["Notifications"])

CRON_SECRET = getattr(settings, "CRON_SECRET", "")
# Max days ahead to check for upcoming releases
NOTIFY_WINDOW_DAYS = 14


@router.post("/send", status_code=200)
async def send_notifications(request: Request, x_cron_secret: str = Header(default="")):
    """
    Triggered daily by cron-job.org.
    Fetches all subscriptions with movies releasing within the next NOTIFY_WINDOW_DAYS days,
    then sends emails where today matches a user's notify_days_before offset.
    """
    if CRON_SECRET and x_cron_secret != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    svc = SubscriptionService()
    notif = NotificationService()
    today = datetime.now(timezone.utc).date()

    sent = failed = skipped = 0

    # Single query: all subscriptions for movies releasing within the notify window
    window_dates = [
        (today + timedelta(days=d)).isoformat()
        for d in range(0, NOTIFY_WINDOW_DAYS + 1)
    ]

    all_subs = await svc.get_subscriptions_for_dates(window_dates)
    logger.info(f"Found {len(all_subs)} subscriptions within {NOTIFY_WINDOW_DAYS}-day window")

    for sub in all_subs:
        movie = sub.get("movies") or {}
        release_date_str = movie.get("release_date")
        if not release_date_str:
            skipped += 1
            continue

        try:
            release_date = datetime.fromisoformat(release_date_str).date()
        except ValueError:
            skipped += 1
            continue

        days_before = (release_date - today).days

        # Only notify if this offset matches what the user configured
        if days_before not in sub.get("notify_days_before", []):
            skipped += 1
            continue

        email = sub.get("email")
        movie_id = sub["movie_id"]
        anon_id = sub["anonymous_id"]

        if not email:
            skipped += 1
            continue

        try:
            await notif.send_email(
                to_email=email,
                movie_title=movie.get("title", "Unknown"),
                release_date=release_date_str,
                days_before=days_before,
                movie_id=movie_id,
                poster_path=movie.get("poster_path"),
            )
            await svc.log_notification(anon_id, movie_id, "email", days_before, "sent")
            sent += 1
        except Exception as e:
            logger.error(f"Email failed for {email} movie {movie_id}: {e}")
            await svc.log_notification(anon_id, movie_id, "email", days_before, "failed", str(e))
            failed += 1

    logger.info(f"Notifications: sent={sent} failed={failed} skipped={skipped}")
    return {
        "status": "success",
        "sent": sent,
        "failed": failed,
        "skipped": skipped,
        "date": today.isoformat(),
    }
