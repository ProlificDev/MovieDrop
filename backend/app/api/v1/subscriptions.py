import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator

logger = logging.getLogger("moviepulse.api.subscriptions")
router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

VALID_DAYS = {0, 1, 3, 7, 14}
PLAN_LIMITS = {"free": 10, "basic": None, "pro": None}  # None = unlimited


class SubscribeRequest(BaseModel):
    anonymous_id: str
    movie_id: int
    notify_days_before: list[int]
    plan: str = "free"
    email: Optional[EmailStr] = None
    push_subscription: Optional[dict] = None

    @field_validator('movie_id')
    @classmethod
    def validate_movie_id(cls, v: int) -> int:
        if v <= 0 or v > 10_000_000:
            raise ValueError('Invalid movie_id')
        return v

    @field_validator('notify_days_before')
    @classmethod
    def validate_days(cls, v: list[int]) -> list[int]:
        if not v or len(v) > 5:
            raise ValueError('notify_days_before must have 1-5 items')
        if not all(d in VALID_DAYS for d in v):
            raise ValueError(f'notify_days_before values must be one of {VALID_DAYS}')
        return v

    @field_validator('plan')
    @classmethod
    def validate_plan(cls, v: str) -> str:
        if v not in PLAN_LIMITS:
            raise ValueError('Invalid plan')
        return v


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

    # Enforce plan limits server-side (never trust client-sent plan)
    limit = PLAN_LIMITS.get(body.plan)
    if limit is not None:
        count = await svc.count_subscriptions(anon_id)
        existing = await svc.get_subscription(anon_id, body.movie_id)
        if not existing and count >= limit:
            raise HTTPException(
                status_code=403,
                detail=f"Subscription limit reached for {body.plan} plan."
            )

    result = await svc.subscribe(
        anonymous_id=anon_id,
        movie_id=body.movie_id,
        notify_days_before=body.notify_days_before,
        plan=body.plan,
        email=body.email,
        push_subscription=None,  # push disabled
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
