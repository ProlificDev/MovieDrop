import logging
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from app.main import limiter, settings
from pydantic import BaseModel, EmailStr, field_validator
from supabase import create_client

logger = logging.getLogger("moviepulse.api.subscriptions")
router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

VALID_DAYS = {0, 1, 3, 7, 14}
PLAN_LIMITS = {"free": 5, "basic": None, "pro": None}  # None = unlimited


class SubscribeRequest(BaseModel):
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
    movie_id: int


def _authenticated_user_id(request: Request) -> UUID:
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.error("Supabase credentials are not configured for authentication.")
        raise HTTPException(status_code=503, detail="Authentication is unavailable.")

    try:
        response = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY
        ).auth.get_user(token)
        return UUID(str(response.user.id))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")


@router.post("", status_code=201)
@limiter.limit("20/minute")
async def subscribe(request: Request, body: SubscribeRequest):
    from app.services.subscriptions import SubscriptionService
    anon_id = _authenticated_user_id(request)
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

    if body.email:
        try:
            movie_res = svc.supabase.table("movies").select("title, release_date, poster_path").eq("id", body.movie_id).limit(1).execute()
            if movie_res.data:
                movie = movie_res.data[0]
                from app.services.notifications import NotificationService
                notif = NotificationService()
                await notif.send_email(
                    to_email=body.email,
                    movie_title=movie.get("title") or "Unknown",
                    release_date=movie.get("release_date") or "TBD",
                    days_before=-1,
                    movie_id=body.movie_id,
                    poster_path=movie.get("poster_path"),
                )
        except Exception as e:
            logger.error(f"Failed to send immediate confirmation email: {e}")

    return {"status": "success", "subscription": result}


@router.delete("", status_code=200)
async def unsubscribe(request: Request, body: UnsubscribeRequest):
    from app.services.subscriptions import SubscriptionService
    anon_id = _authenticated_user_id(request)
    svc = SubscriptionService()
    await svc.unsubscribe(anon_id, body.movie_id)
    return {"status": "success"}


@router.get("/check", status_code=200)
async def check_subscription(request: Request, movie_id: int):
    from app.services.subscriptions import SubscriptionService
    anon_id = _authenticated_user_id(request)
    svc = SubscriptionService()
    sub = await svc.get_subscription(anon_id, movie_id)
    return {"subscribed": sub is not None, "subscription": sub}


@router.get("/all", status_code=200)
async def get_all_subscriptions(request: Request):
    from app.services.subscriptions import SubscriptionService
    anon_id = _authenticated_user_id(request)
    svc = SubscriptionService()
    subs = await svc.get_all_subscriptions(anon_id)
    return {"status": "success", "count": len(subs), "subscriptions": subs}
