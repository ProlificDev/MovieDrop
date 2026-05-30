import logging
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from app.services.watchlist import WatchlistService

logger = logging.getLogger("cinepulse.api.watchlist")
router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", status_code=200)
async def get_watchlist(user_id: str = Query(..., description="User ID (UUID)")):
    """
    Retrieve all movies in user's watchlist.
    
    Query Parameters:
        user_id: UUID of the user
    """
    try:
        # Validate UUID format
        user_uuid = UUID(user_id)
        watchlist_service = WatchlistService()
        watchlist = await watchlist_service.get_user_watchlist(user_uuid)
        
        return {
            "status": "success",
            "user_id": user_id,
            "count": len(watchlist),
            "movies": watchlist
        }
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id format. Must be a valid UUID."
        )
    except Exception as e:
        logger.error(f"Failed to fetch watchlist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch watchlist: {str(e)}"
        )


@router.post("/add", status_code=201)
async def add_to_watchlist(
    user_id: str = Query(..., description="User ID (UUID)"),
    movie_id: int = Query(..., description="TMDB Movie ID")
):
    """
    Add a movie to user's watchlist.
    
    Query Parameters:
        user_id: UUID of the user
        movie_id: TMDB movie ID to add
    """
    try:
        user_uuid = UUID(user_id)
        watchlist_service = WatchlistService()
        
        # Check if already in watchlist
        is_in = await watchlist_service.is_in_watchlist(user_uuid, movie_id)
        if is_in:
            return {
                "status": "exists",
                "message": "Movie already in watchlist",
                "user_id": user_id,
                "movie_id": movie_id
            }
        
        result = await watchlist_service.add_to_watchlist(user_uuid, movie_id)
        
        return {
            "status": "success",
            "message": "Movie added to watchlist",
            "user_id": user_id,
            "movie_id": movie_id,
            "watchlist_entry": result
        }
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id format. Must be a valid UUID."
        )
    except Exception as e:
        logger.error(f"Failed to add movie to watchlist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add movie to watchlist: {str(e)}"
        )


@router.delete("/remove", status_code=200)
async def remove_from_watchlist(
    user_id: str = Query(..., description="User ID (UUID)"),
    movie_id: int = Query(..., description="TMDB Movie ID")
):
    """
    Remove a movie from user's watchlist.
    
    Query Parameters:
        user_id: UUID of the user
        movie_id: TMDB movie ID to remove
    """
    try:
        user_uuid = UUID(user_id)
        watchlist_service = WatchlistService()
        
        # Check if in watchlist
        is_in = await watchlist_service.is_in_watchlist(user_uuid, movie_id)
        if not is_in:
            raise HTTPException(
                status_code=404,
                detail="Movie not found in user's watchlist"
            )
        
        await watchlist_service.remove_from_watchlist(user_uuid, movie_id)
        
        return {
            "status": "success",
            "message": "Movie removed from watchlist",
            "user_id": user_id,
            "movie_id": movie_id
        }
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id format. Must be a valid UUID."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove movie from watchlist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove movie from watchlist: {str(e)}"
        )


@router.get("/check", status_code=200)
async def check_in_watchlist(
    user_id: str = Query(..., description="User ID (UUID)"),
    movie_id: int = Query(..., description="TMDB Movie ID")
):
    """
    Check if a specific movie is in user's watchlist.
    
    Query Parameters:
        user_id: UUID of the user
        movie_id: TMDB movie ID to check
    """
    try:
        user_uuid = UUID(user_id)
        watchlist_service = WatchlistService()
        is_in = await watchlist_service.is_in_watchlist(user_uuid, movie_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "movie_id": movie_id,
            "in_watchlist": is_in
        }
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id format. Must be a valid UUID."
        )
    except Exception as e:
        logger.error(f"Failed to check watchlist status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check watchlist status: {str(e)}"
        )


@router.get("/count", status_code=200)
async def get_watchlist_count(user_id: str = Query(..., description="User ID (UUID)")):
    """
    Get total count of movies in user's watchlist.
    
    Query Parameters:
        user_id: UUID of the user
    """
    try:
        user_uuid = UUID(user_id)
        watchlist_service = WatchlistService()
        count = await watchlist_service.get_watchlist_count(user_uuid)
        
        return {
            "status": "success",
            "user_id": user_id,
            "count": count
        }
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id format. Must be a valid UUID."
        )
    except Exception as e:
        logger.error(f"Failed to get watchlist count: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get watchlist count: {str(e)}"
        )
