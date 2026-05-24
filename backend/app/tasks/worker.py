from celery import Celery
from app.main import settings

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
    # Clean up results automatically after 2 days to keep Redis space optimized
    result_expires=172800, 
)

# Discover and load tasks declared within this package module
celery_app.autodiscover_tasks(["app.tasks"])
