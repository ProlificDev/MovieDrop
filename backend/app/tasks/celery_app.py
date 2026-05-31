import logging
from celery import Celery
# Importing app.main inside Celery modules caused import-time side effects
# (FastAPI route registration) and circular imports.
# Celery app is configured via environment variables instead.
import os


class _TmpSettings:
    REDIS_URL = os.getenv("REDIS_URL", "")


settings = _TmpSettings()


logger = logging.getLogger("moviepulse.celery")

# Ensure the celery app is importable without initializing FastAPI.
# Scheduler module imports celery_app, and api routes import scheduler tasks,
# so we must avoid any app.main import-time side effects here.


# Shared Celery app instance used by worker, scheduler, and beat.
# Keeping this in a separate module avoids circular imports between
# app.tasks.worker <-> app.tasks.scheduler.
# Celery/Kombu redis SSL handling:
# Upstash URLs sometimes use `rediss://` but require explicit ssl_cert_reqs.
# Setting CERT_NONE allows it to run without TLS verification (Upstash is already managed).
# If REDIS_URL isn't set, Celery may fall back to its default AMQP broker.
# Fail fast (with a clear message) so we don't silently connect to amqp://localhost:5672.
if not settings.REDIS_URL:
    logger.warning(
        "REDIS_URL is not set. Celery broker/backend will be misconfigured and may fall back to its default AMQP broker. "
        "Set REDIS_URL in the environment (e.g. redis://localhost:6379/0 or your Upstash Redis URL) to enable scheduled notifications."
    )


celery_app = Celery(
    "moviedrop_tasks",
    broker=settings.REDIS_URL or "redis://127.0.0.1:6379/0",
    backend=settings.REDIS_URL or "redis://127.0.0.1:6379/0",
    broker_use_ssl={},
    redis_backend_use_ssl={},
)




celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    result_expires=172800,
)

