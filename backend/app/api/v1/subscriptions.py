import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

logger = logging.getLogger("moviepulse.api.subscriptions")
router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


class SubscribeRequest(BaseModel):
    anonymous_id: str
    movie_id: int
    notify_days_before: list[int]
    plan: str = "free"
    email: Optional[str] = None
    push_subscription: Optional[dict] = None


class UnsubscribeRequest(BaseModel):
    anonymous_id: str
    movie_id: int


def _parse_uuid(value: str) -> UUID:
    try:
        return UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid anonymous_id format.")


@router.post("", status_code=201)
async def subscribe(body: SubscribeRequest):
    from app.services.subscriptions import SubscriptionService
    anon_id = _parse_uuid(body.anonymous_id)
    svc = SubscriptionService()

    # Enforce plan limits
    count = await svc.count_subscriptions(anon_id)
    limits = {"free": 1, "basic": 10, "pro": 50}
    limit = limits.get(body.plan, 1)
    existing = await svc.get_subscription(anon_id, body.movie_id)
    if not existing and count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Subscription limit reached for {body.plan} plan ({limit} movies)."
        )

    result = await svc.subscribe(
        anonymous_id=anon_id,
        movie_id=body.movie_id,
        notify_days_before=body.notify_days_before,
        plan=body.plan,
        email=body.email,
        push_subscription=body.push_subscription,
    )
    return {"status": "success", "subscription": result}


@router.delete("", status_code=200)
async def unsubscribe(body: UnsubscribeRequest):
    from app.services.subscriptions import SubscriptionService
    anon_id = _parse_uuid(body.anonymous_id)
    svc = SubscriptionService()
    await svc.unsubscribe(anon_id, body.movie_id)
    return {"status": "success"}


@router.get("/check", status_code=200)
async def check_subscription(anonymous_id: str, movie_id: int):
    from app.services.subscriptions import SubscriptionService
    anon_id = _parse_uuid(anonymous_id)
    svc = SubscriptionService()
    sub = await svc.get_subscription(anon_id, movie_id)
    return {"subscribed": sub is not None, "subscription": sub}


@router.get("/all", status_code=200)
async def get_all_subscriptions(anonymous_id: str):
    from app.services.subscriptions import SubscriptionService
    anon_id = _parse_uuid(anonymous_id)
    svc = SubscriptionService()
    subs = await svc.get_all_subscriptions(anon_id)
    return {"status": "success", "count": len(subs), "subscriptions": subs}
