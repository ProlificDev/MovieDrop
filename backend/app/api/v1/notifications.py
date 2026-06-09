import logging
from fastapi import APIRouter, Header, HTTPException, Request
from app.main import limiter
from app.services.subscriptions import SubscriptionService
from app.services.notifications import NotificationService
from datetime import datetime, timedelta, timezone
from app.main import settings

logger = logging.getLogger("moviedrop.api.notifications")
router = APIRouter(prefix="/notifications", tags=["Notifications"])

CRON_SECRET = getattr(settings, "CRON_SECRET", "")


@router.post("/send", status_code=200)
@limiter.limit("5/minute")
async def send_notifications(request: Request, x_cron_secret: str = Header(default="")):
    """
    Triggered daily by cron-job.org.
    Loops through all subscriptions and sends email notifications
    for movies releasing on the configured notify_days_before offsets.
    """
    # Simple secret check to prevent unauthorized calls
    if CRON_SECRET and x_cron_secret != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    svc = SubscriptionService()
    notif = NotificationService()
    today = datetime.now(timezone.utc).date()

    sent = failed = 0

    for days_before in range(0, 31):
        target_date = (today + timedelta(days=days_before)).isoformat()
        subscriptions = await svc.get_due_subscriptions(target_date)

        for sub in subscriptions:
            if days_before not in sub.get("notify_days_before", []):
                continue

            movie = sub.get("movies", {})
            movie_id = sub["movie_id"]
            anon_id = sub["anonymous_id"]

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

    logger.info(f"Notifications sent={sent} failed={failed}")
    return {"status": "success", "sent": sent, "failed": failed, "date": today.isoformat()}
