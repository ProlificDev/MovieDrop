import logging
import resend
from typing import Optional
from pywebpush import webpush, WebPushException
import json

logger = logging.getLogger("moviepulse.notifications")


class NotificationService:

    def __init__(self):
        from app.main import settings
        self.settings = settings
        resend.api_key = settings.RESEND_API_KEY

    async def send_email(
        self,
        to_email: str,
        movie_title: str,
        release_date: str,
        days_before: int,
        movie_id: int,
        poster_path: Optional[str] = None,
    ) -> bool:
        subject = self._email_subject(movie_title, days_before)
        html = self._email_html(movie_title, release_date, days_before, movie_id, poster_path)
        try:
            resend.Emails.send({
                "from": "MoviePulse <onboarding@resend.dev>",
                "to": [to_email],
                "subject": subject,
                "html": html,
            })
            logger.info(f"Email sent to {to_email} for '{movie_title}' ({days_before}d before)")
            return True
        except Exception as e:
            logger.error(f"Email failed for {to_email}: {e}")
            raise

    async def send_push(
        self,
        push_subscription: dict,
        movie_title: str,
        release_date: str,
        days_before: int,
        movie_id: int,
    ) -> bool:
        from app.main import settings
        payload = json.dumps({
            "title": self._push_title(movie_title, days_before),
            "body": self._push_body(movie_title, release_date, days_before),
            "icon": "/icon.png",
            "badge": "/icon.png",
            "tag": f"movie-{movie_id}",
            "url": f"/movies/{movie_id}",
            "requireInteraction": days_before == 0,
        })
        try:
            webpush(
                subscription_info=push_subscription,
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_CLAIM_EMAIL},
            )
            logger.info(f"Push sent for '{movie_title}' ({days_before}d before)")
            return True
        except WebPushException as e:
            logger.error(f"Push failed for movie {movie_id}: {e}")
            raise

    # ── Helpers ──────────────────────────────────────────────────────────

    def _email_subject(self, title: str, days_before: int) -> str:
        if days_before == 0:
            return f"🎬 {title} is out TODAY!"
        if days_before == 1:
            return f"⏰ {title} releases TOMORROW!"
        return f"📅 {title} releases in {days_before} days"

    def _push_title(self, title: str, days_before: int) -> str:
        if days_before == 0:
            return f"🎬 {title} is out TODAY!"
        if days_before == 1:
            return f"⏰ {title} releases tomorrow!"
        return f"📅 {title} in {days_before} days"

    def _push_body(self, title: str, release_date: str, days_before: int) -> str:
        if days_before == 0:
            return f"Head to the cinema — {title} is in theatres now!"
        return f"Release date: {release_date}. Tap to see details."

    def _email_html(
        self,
        title: str,
        release_date: str,
        days_before: int,
        movie_id: int,
        poster_path: Optional[str],
    ) -> str:
        poster_url = (
            f"https://image.tmdb.org/t/p/w500{poster_path}"
            if poster_path and not poster_path.startswith("http")
            else (poster_path or "")
        )
        subject = self._email_subject(title, days_before)
        poster_html = (
            f'<img src="{poster_url}" alt="{title}" style="width:120px;border-radius:8px;margin-bottom:16px;" />'
            if poster_url else ""
        )
        return f"""
        <div style="font-family:sans-serif;background:#06040d;color:#f1ecfa;padding:40px;max-width:480px;margin:auto;border-radius:16px;">
            {poster_html}
            <h1 style="font-size:22px;margin-bottom:8px;">{subject}</h1>
            <p style="color:#9ca3af;font-size:14px;margin-bottom:24px;">Release date: <strong style="color:#f1ecfa;">{release_date}</strong></p>
            <a href="https://moviepulse.app/movies/{movie_id}"
               style="display:inline-block;background:linear-gradient(90deg,#FF006E,#D946EF);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;">
               View Movie →
            </a>
            <p style="color:#4b5563;font-size:11px;margin-top:32px;">
                You're receiving this because you subscribed on MoviePulse.<br/>
                To unsubscribe, visit the movie page and turn off notifications.
            </p>
        </div>
        """
