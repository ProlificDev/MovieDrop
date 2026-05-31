import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from celery.result import AsyncResult
from app.tasks.scheduler import sync_upcoming_movies

# NOTE: lazy import SyncService to avoid circular imports during Celery startup.
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.sync import SyncService


logger = logging.getLogger("cinepulse.api.sync")
router = APIRouter(prefix="/sync", tags=["Pipeline Sync"])

@router.post("/trigger", status_code=202)
async def trigger_async_sync():
    """
    Manually dispatch the movie database sync to the Celery background worker queue.
    Returns the task ID instantly without blocking the caller.
    """
    try:
        # Send task to Celery queue out-of-band
        task = sync_upcoming_movies.delay()
        logger.info(f"Background task triggered manually via API. Task ID: {task.id}")
        return {
            "status": "queued",
            "task_id": task.id,
            "message": "MovieDrop upcoming movie database sync dispatched to Celery background queue."
        }
    except Exception as e:
        logger.error(f"Failed to queue Celery sync task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue sync job: {str(e)}"
        )

@router.get("/status/{task_id}")
async def get_sync_status(task_id: str):
    """
    Inspect the progress or result of a previously triggered Celery sync job.
    """
    try:
        task_result = AsyncResult(task_id)
        response = {
            "task_id": task_id,
            "status": task_result.status, # e.g. PENDING, STARTED, SUCCESS, FAILURE
            "result": None,
            "error": None
        }

        if task_result.status == "SUCCESS":
            response["result"] = task_result.result
        elif task_result.status == "FAILURE":
            response["error"] = str(task_result.info)
            
        return response
    except Exception as e:
        logger.error(f"Failed to query task status for {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch task status: {str(e)}"
        )

@router.post("/trigger-sync-now")
async def trigger_synchronous_sync(max_pages: int = 2, clear_first: bool = False):
    """
    Runs the synchronization pipeline synchronously.
    Set clear_first=true to wipe old movies before syncing fresh 2025 data.
    """
    logger.info(f"Manual sync triggered. max_pages={max_pages}, clear_first={clear_first}")
    try:
        sync_service = SyncService()

        if clear_first:
            deleted = await sync_service.clear_all_movies()
            logger.info(f"Cleared {deleted} old movies before sync.")

        result = await sync_service.sync_pipeline(
            max_pages=max_pages,
            skip_recent=(not clear_first),
        )

        if result.get("status") == "failed":
            raise HTTPException(
                status_code=502,
                detail={"message": "Sync encountered errors.", "details": result},
            )

        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Synchronous sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Sync crashed: {e}")
