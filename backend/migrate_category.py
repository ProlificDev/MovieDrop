"""
One-off migration: Add 'category' column to the movies table.
Runs a raw SQL ALTER TABLE via the Supabase management API.
"""
import os, sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

url = os.getenv("SUPABASE_URL", "")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not url or not key:
    print("[ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

client = create_client(url, key)

# Tag all existing movies as 'upcoming' since they came from the /upcoming endpoint
print("Tagging existing movies with category='upcoming'...")
try:
    client.table("movies").update({"category": "upcoming"}).neq("id", 0).execute()
    print("  Done.")
except Exception as e:
    print(f"  Note: {e} (column may not exist yet, will try adding it)")

print("\nTo add the 'category' column, run this SQL in your Supabase SQL Editor:")
print("""
  ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS category text DEFAULT 'upcoming';
  CREATE INDEX IF NOT EXISTS idx_movies_category ON public.movies(category);
""")
print("Then re-run this script to tag existing rows.")
