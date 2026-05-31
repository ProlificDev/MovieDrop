import json
import logging
import os
from typing import Any, Dict, Optional

import httpx
from supabase import create_client, Client

from app.main import settings

logger = logging.getLogger("moviepulse.paystack")


class PaystackService:
    def __init__(self):
        if not getattr(settings, "PAYSTACK_SECRET_KEY", ""):
            # Keep runtime fail explicit
            raise ValueError("PAYSTACK_SECRET_KEY is required in backend/.env")
        if not getattr(settings, "PAYSTACK_WEBHOOK_SECRET", ""):
            raise ValueError("PAYSTACK_WEBHOOK_SECRET is required in backend/.env")

        self.secret_key = settings.PAYSTACK_SECRET_KEY
        self.webhook_secret = settings.PAYSTACK_WEBHOOK_SECRET

        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )

    def create_checkout_url(
        self,
        email: Optional[str],
        amount: int,
        metadata: Dict[str, Any],
    ) -> str:
        """Create Paystack checkout using amount-based charges.

        amount is NGN (not kobo). Paystack expects kobo.
        """
        paystack_amount_kobo = int(amount) * 100

        # Paystack inline checkout:
        # https://api.paystack.co/transaction/initialize
        init_url = "https://api.paystack.co/transaction/initialize"

        body = {
            "email": email or "customer@example.com",
            "amount": paystack_amount_kobo,
            "reference": self._make_reference(metadata),
            "metadata": metadata,
            "currency": "NGN",
            "plan": None,
            # 'callback_url' can be added; for now rely on webhook.
        }

        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

        # Note: Sync init for simplicity; works in async routes.
        resp = httpx.post(init_url, headers=headers, json=body, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        if not data.get("status"):
            raise RuntimeError(f"Paystack init failed: {data}")

        return data["data"]["authorization"]["url"]

    def verify_and_parse_webhook(self, raw_body: bytes, headers: Dict[str, str]) -> Dict[str, Any]:
        """Verify Paystack webhook signature and return parsed JSON."""
        sig = headers.get("x-paystack-signature") or headers.get("X-PAYSTACK-SIGNATURE")
        if not sig:
            raise ValueError("Missing Paystack signature header")

        computed = hmac.new(
            self.webhook_secret.encode(),
            raw_body,
            hashlib.sha512,
        ).hexdigest()

        # Paystack uses hex signature; compare case-insensitive.
        if not hmac.compare_digest(computed, sig):
            raise ValueError("Invalid Paystack webhook signature")

        return json.loads(raw_body.decode("utf-8"))

    async def mark_plan_active(self, anonymous_id: str, plan: str) -> None:
        """Persist plan entitlement for anonymous users.

        Uses a simple table `guest_plan_entitlements`:
          - anonymous_id (uuid/text)
          - plan (text)
          - active (bool)
          - updated_at

        If table doesn't exist, this will fail loudly.
        """
        payload = {
            "anonymous_id": str(anonymous_id),
            "plan": plan,
            "active": True,
        }

        # upsert by anonymous_id
        self.supabase.table("guest_plan_entitlements").upsert(payload, on_conflict="anonymous_id").execute()

    def _make_reference(self, metadata: Dict[str, Any]) -> str:
        # Paystack reference must be unique.
        anon = metadata.get("anonymous_id", "anon")
        plan = metadata.get("plan", "plan")
        return f"moviepulse_{plan}_{anon}_{os.urandom(4).hex()}"

