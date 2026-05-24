import asyncio
import logging
from celery.schedules import crontab
from app.tasks.worker import celery_app
from app.services.sync import SyncService

logger = logging.getLogger("cinepulse.tasks")

@celery_app.task(name="app.tasks.scheduler.sync_upcoming_movies")
def sync_upcoming_movies():
    """
    Scheduled Celery task that executes daily.
    Since SyncService methods are asynchronous, we wrap execution inside a clean 
    asyncio event loop container.
    """
    logger.info("Celery Task Triggered: Synchronizing upcoming releases from TMDB to Supabase...")
    
    try:
        # Get or spawn a running asyncio event loop inside the worker thread
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # Instantiate the sync service and run it to completion
        sync_service = SyncService()
        result = loop.run_until_complete(sync_service.sync_pipeline(max_pages=5))
        
        logger.info(f"Celery Task Completed successfully: {result}")
        return result
    except Exception as e:
        logger.error(f"Celery Task Failed with exception: {str(e)}")
        raise e

# Configure Celery Beat to trigger this task periodically every 24 hours at midnight UTC
celery_app.conf.beat_schedule = {
    "daily-movie-database-sync": {
        "task": "app.tasks.scheduler.sync_upcoming_movies",
        "schedule": crontab(hour=0, minute=0),
    }
}
