from fastapi import APIRouter
from app.api.v1.sync import router as sync_router
from app.api.v1.watchlist import router as watchlist_router

# Core centralized API router mapping version 1 namespaces
api_router = APIRouter(prefix="/api/v1")

# Register pipeline routes
api_router.include_router(sync_router)

# Register watchlist routes
api_router.include_router(watchlist_router)
