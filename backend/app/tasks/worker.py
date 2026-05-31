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
from app.tasks.celery_app import celery_app, settings

logger = logging.getLogger("cinepulse.worker")

# Beat schedule lives here (so it is configured when running `celery ... beat`).
celery_app.conf.update(
    beat_schedule={
        "sync-upcoming-movies-every-6-hours": {
            "task": "app.tasks.scheduler.sync_upcoming_movies",
            "schedule": 6 * 60 * 60,
            "options": {"queue": "default"},
        },
        "send-notifications-daily": {
            "task": "app.tasks.scheduler.send_notifications",
            "schedule": 24 * 60 * 60,
            "options": {"queue": "default"},
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
