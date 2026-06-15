import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.services.sync import SyncService


logger = logging.getLogger("cinepulse.api.sync")
router = APIRouter(prefix="/sync", tags=["Pipeline Sync"])



@router.post("/trigger-sync-now")
async def trigger_synchronous_sync(request: Request, max_pages: int = 2, clear_first: bool = False):
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
