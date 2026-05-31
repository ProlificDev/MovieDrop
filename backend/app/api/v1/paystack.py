import hmac
import hashlib
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from app.services.paystack import PaystackService

logger = logging.getLogger("moviepulse.api.paystack")
router = APIRouter(prefix="/paystack", tags=["Paystack"])


class CheckoutBody:
    # minimal payload from frontend
    anonymous_id: str
    plan: str  # 'basic' | 'pro'
    amount: int  # in NGN kobo? we will pass plain NGN amount and convert


@router.post("/create-checkout", status_code=201)
async def create_checkout(body: CheckoutBody):
    """Create a Paystack inline checkout URL."""
    try:
        svc = PaystackService()
        url = svc.create_checkout_url(
            email=None,
            amount=body.amount,
            metadata={
                "anonymous_id": body.anonymous_id,
                "plan": body.plan,
            },
        )
        return {"status": "success", "url": url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"create_checkout failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook", status_code=200)
async def paystack_webhook(request: Request):
    """Paystack webhook endpoint. Verifies signature and updates plan status."""
    try:
        raw_body = await request.body()
        svc = PaystackService()
        event = svc.verify_and_parse_webhook(raw_body, request.headers)

        # Expected event: charge.success
        # We'll parse for metadata (anonymous_id, plan) and then mark entitlement.
        data = event.get("event") if isinstance(event, dict) else None
        payload = event.get("data") if isinstance(event, dict) else None

        # Paystack event types are flexible; we only need metadata.
        metadata = {}
        if payload and isinstance(payload, dict):
            metadata = payload.get("metadata") or {}

        anonymous_id = metadata.get("anonymous_id")
        plan = metadata.get("plan")

        if not anonymous_id or not plan:
            logger.warning(f"Webhook missing metadata: {event}")
            return {"status": "ignored"}

        await svc.mark_plan_active(anonymous_id=anonymous_id, plan=plan)
        return {"status": "ok"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"paystack_webhook failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

