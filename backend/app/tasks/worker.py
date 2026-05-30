"""
Celery worker configuration and command-line entry point.

To run the worker:
    celery -A app.tasks.worker worker --loglevel=info

To run the scheduler (beat):
    celery -A app.tasks.worker beat --loglevel=info

To run both in one process:
    celery -A app.tasks.worker worker --beat --loglevel=info
"""

import logging
from celery import Celery
from app.main import settings

logger = logging.getLogger("cinepulse.worker")

# Initialize Celery app pointing to Upstash Redis as both broker and result backend
celery_app = Celery(
    "moviedrop_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Celery operational settings for high reliability
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # Hard limit: 30 minutes per task
    task_soft_time_limit=25 * 60,  # Soft limit: 25 minutes
    # Clean up results automatically after 2 days to keep Redis space optimized
    result_expires=172800,
    beat_schedule={
        "sync-upcoming-movies-every-6-hours": {
            "task": "app.tasks.scheduler.sync_upcoming_movies",
            "schedule": 6 * 60 * 60,  # Every 6 hours
            "options": {"queue": "default"}
        },
    }
)

# Discover and load tasks declared within this package module
celery_app.autodiscover_tasks(["app.tasks"])

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

if __name__ == "__main__":
    logger.info("MovieDrop Celery Worker Configuration Loaded")
    logger.info(f"Redis Broker: {settings.REDIS_URL}")
    logger.info("To start the worker, run: celery -A app.tasks.worker worker --loglevel=info")
    logger.info("To start the scheduler, run: celery -A app.tasks.worker beat --loglevel=info")
