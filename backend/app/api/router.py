from fastapi import APIRouter
from app.api.v1.sync import router as sync_router
from app.api.v1.watchlist import router as watchlist_router
from app.api.v1.subscriptions import router as subscriptions_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(sync_router)
api_router.include_router(watchlist_router)
api_router.include_router(subscriptions_router)
