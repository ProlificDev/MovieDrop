# MovieDrop - Setup Guide & Checklist

Use this as the project setup checklist. The current frontend is public to view and does not require sign-in. Supabase is still needed for the backend movie database and for later watchlist/notification phases.

---

## Step 1 - Create External Service Accounts

| Service | What it's for | URL |
| :-- | :-- | :-- |
| Supabase | Postgres database, RLS, future user/watchlist tables | https://supabase.com |
| TMDB | Movie release data | https://www.themoviedb.org/signup |
| Resend | Future notification emails | https://resend.com |

| Netlify | Frontend hosting | https://netlify.com |
| Railway | Backend, worker, and scheduler hosting | https://railway.app |

---

## Step 2 - Set Up Supabase

1. Create a new Supabase project.
2. In Supabase, open `Project Settings > API`.
3. Copy these values:
   - Project URL
   - `anon` / `public` key
   - `service_role` key
4. Keep the `service_role` key private. It belongs only in backend/Railway environment variables.

Then open `SQL Editor > New Query` and run these scripts in order:

1. `database/schema.sql`
2. `database/migration_phase2.sql`

After running both scripts, confirm these tables exist in `Table Editor`:

| Table | Purpose |
| :-- | :-- |
| `movies` | Public movie cache populated by the backend sync |
| `users` | Future mirrored Supabase Auth profiles |
| `watchlists` | Future per-user saved movies |
| `notification_preferences` | Future email/push settings |
| `notifications_log` | Future notification audit log |

Important: public viewing only needs the `movies` table. The auth-related tables can stay in place for later phases.

---

## Step 3 - Create Local Environment Files

These files are not committed. Create them from the examples.

### `backend/.env`

Copy `backend/.env.example` to `backend/.env`, then fill in:

```env
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

TMDB_API_KEY="your-tmdb-api-key"

RESEND_API_KEY="re_..."


VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_CLAIM_EMAIL="mailto:you@example.com"
```

### `frontend/.env.local`

The current frontend page does not use Supabase directly, but keep this ready for upcoming movie browsing/watchlist work.

Copy `frontend/.env.local.example` to `frontend/.env.local`, then fill in:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"

NEXT_PUBLIC_API_URL="http://localhost:8000"

NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

---

## Step 4 - Install Backend Dependencies

Open a terminal inside `backend/`:

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

On Mac/Linux, use:

```bash
source venv/bin/activate
```

---

## Step 5 - Test Backend Configuration

With `backend/.env` filled in and the virtual environment active:

```bash
uvicorn app.main:app --reload
```

Open:

```text
http://localhost:8000/health
```

Expected configuration fields:

```json
{
  "tmdb_status": "configured",
  "database_status": "configured"
}
```

If `database_status` is `missing_url`, `SUPABASE_URL` is missing from `backend/.env`.

---

## Step 6 - Test the Movie Sync Pipeline

Open:

```text
http://localhost:8000/docs
```

Run:

```text
POST /api/v1/sync/trigger-sync-now
```

Expected shape:

```json
{
  "status": "success",
  "upcoming_fetched": 40,
  "processed": 40,
  "upserted": 40,
  "skipped": 0,
  "failed": 0,
  "errors": []
}
```

Then check Supabase `Table Editor > movies` and confirm rows were inserted.

---

## Step 7 - Run Frontend Locally

Open a terminal inside `frontend/`:

```bash
npm.cmd run dev
```

Then open:

```text
http://127.0.0.1:3000
```

If port `3000` is stuck or showing stale Next.js errors, stop old Node processes, delete `frontend/.next`, and start again.

You can also use the project launcher:

```text
start-MovieDrop-dev.bat
```

---

## Step 9 - Deploy

### Frontend - Netlify

1. Push the `frontend/` app to GitHub.
2. Connect the repo to Netlify.
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add all `NEXT_PUBLIC_*` variables in Netlify.

### Backend - Railway

Create these services from the same repo/backend folder:

| Service | Start command |
| :-- | :-- |
| `MovieDrop-backend` | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Backend is hosted on **Render** at `https://moviedrop-backend.onrender.com`.


Add backend env vars from `backend/.env` to each Railway service.

After deploying the frontend, update Railway:

```env
BACKEND_CORS_ORIGINS=["https://moviedrop.site","https://www.moviedrop.site","https://moviedrop.netlify.app"]
```

---

## Current Local Gaps

- `backend/.env` is missing.
- `frontend/.env.local` is missing.
- Supabase SQL must be run manually in the Supabase dashboard.
- The current frontend is still a public landing/preview page; it does not yet render movie rows from Supabase or the backend.

---

## Key Files

| File | Purpose |
| :-- | :-- |
| `backend/.env.example` | Backend env template |
| `frontend/.env.local.example` | Frontend env template |
| `database/schema.sql` | Base Supabase schema |
| `database/migration_phase2.sql` | Movie table additions |
| `backend/app/main.py` | FastAPI entry point and CORS |
| `backend/app/services/sync.py` | TMDB to Supabase sync |
| `backend/app/api/v1/sync.py` | Manual and async sync endpoints |

| `frontend/netlify.toml` | Netlify build and API rewrite |
| `backend/Procfile` | Railway process definitions |
| `backend/Dockerfile` | Backend container |
