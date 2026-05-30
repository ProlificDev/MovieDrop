import asyncio
import logging
from celery.schedules import crontab
from app.tasks.worker import celery_app
from app.services.sync import SyncService

logger = logging.getLogger("cinepulse.scheduler")


def run_async_task(coro):
    """
    Helper to run async functions in Celery tasks.
    Creates a new event loop if needed.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(coro)


@celery_app.task(bind=True, name="app.tasks.scheduler.sync_upcoming_movies")
def sync_upcoming_movies(self, max_pages: int = 3, skip_recent: bool = True):
    """
    Background worker task: Full multi-category sync pipeline.
    Fetches upcoming and now-playing movies from TMDB and syncs to Supabase.

    Since SyncService methods are asynchronous, we wrap execution inside a clean 
    asyncio event loop container.

    Args:
        max_pages (int): How many TMDB pages to fetch per category (20 movies/page).
        skip_recent (bool): If True, skip movies already synced in the last 24h.

    Returns:
        dict: Sync result with status, counts, and error details.
    """
    logger.info(f"[Task {self.request.id}] Starting sync_upcoming_movies task...")
    
    try:
        sync_service = SyncService()
        result = run_async_task(
            sync_service.sync_pipeline(max_pages=max_pages, skip_recent=skip_recent)
        )
        
        logger.info(
            f"[Task {self.request.id}] Sync completed. "
            f"Status: {result.get('status')}, "
            f"Upserted: {result.get('upserted')}, "
            f"Skipped: {result.get('skipped')}, "
            f"Errors: {len(result.get('errors', []))}"
        )
        return result
        
    except Exception as e:
        logger.error(f"[Task {self.request.id}] Sync task failed: {str(e)}", exc_info=True)
        return {
            "status": "failed",
            "error": str(e),
            "task_id": self.request.id
        }
