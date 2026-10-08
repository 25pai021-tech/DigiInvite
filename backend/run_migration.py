"""
Run publish migration via Supabase Management API.
Uses: POST https://api.supabase.com/v1/projects/{ref}/database/query
Requires: SUPABASE_ACCESS_TOKEN (personal access token from supabase.com/dashboard/account/tokens)
Alternatively tries direct postgres via psycopg2.
"""
import sys, os, json, subprocess

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJECT_REF = "ipspvqidfxtixwbyrcrr"
SERVICE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwc3B2cWlkZnh0aXh3YnlyY3JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4OTUyOCwiZXhwIjoyMDk5MTY1NTI4fQ."
    "qmGd0ZmH0Vqc90xI8WnoyyDbZt4_cnBOMpSdouxsT2k"
)
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"

# The full SQL to run
MIGRATION_SQL = """
-- Smart Adaptive Invitation Publish Migration
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING)

ALTER TABLE invitation_requests
  ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_invitation_requests_public_slug
  ON invitation_requests(public_slug);

CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitation_requests(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT DEFAULT 'Guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_photos_invitation_id
  ON event_photos(invitation_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view event_photos" ON event_photos;
CREATE POLICY "Public can view event_photos"
  ON event_photos FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can insert event_photos" ON event_photos;
CREATE POLICY "Public can insert event_photos"
  ON event_photos FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Anyone can read published invitation_requests" ON invitation_requests;
CREATE POLICY "Anyone can read published invitation_requests"
  ON invitation_requests FOR SELECT
  USING (published = TRUE OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

DROP POLICY IF EXISTS "Public can upload event-photos" ON storage.objects;
CREATE POLICY "Public can upload event-photos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "Public can view event-photos" ON storage.objects;
CREATE POLICY "Public can view event-photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'event-photos');
"""


def try_management_api(access_token: str) -> bool:
    """Try Supabase Management API to run SQL."""
    import requests
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    resp = requests.post(url, json={"query": MIGRATION_SQL}, headers=headers, timeout=60)
    print(f"Management API response: HTTP {resp.status_code}")
    print(resp.text[:400])
    return resp.status_code in (200, 201)


def try_psycopg2(db_url: str) -> bool:
    """Try direct postgres connection with psycopg2."""
    try:
        import psycopg2
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(MIGRATION_SQL)
        conn.close()
        print("psycopg2: Migration applied successfully!")
        return True
    except ImportError:
        print("psycopg2 not installed.")
        return False
    except Exception as e:
        print(f"psycopg2 error: {e}")
        return False


def verify_via_supabase_py():
    """Check if columns exist by querying a row."""
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    from db import supabase
    try:
        res = supabase.table("invitation_requests").select("id, public_slug, published").limit(1).execute()
        print("Column check: public_slug column EXISTS!")
        return True
    except Exception as e:
        print(f"Column check: public_slug NOT found ({e})")
        return False


def main():
    print("=" * 62)
    print("DigiInvite - Supabase Migration Runner")
    print("=" * 62)

    # First, verify current state
    print("\nChecking current schema state...")
    cols_exist = verify_via_supabase_py()
    if cols_exist:
        print("Migration already applied! Columns exist.")
        return

    print("\nColumns not yet applied. Attempting migration...")

    # Try management API with access token from env
    access_token = os.getenv("SUPABASE_ACCESS_TOKEN", "")
    if access_token:
        print("\nTrying Supabase Management API...")
        if try_management_api(access_token):
            print("Management API: SUCCESS")
            return

    # Try psycopg2 direct connection
    db_url = os.getenv("DATABASE_URL", "")
    if db_url:
        print("\nTrying psycopg2 direct connection...")
        if try_psycopg2(db_url):
            return

    # Neither worked — print instructions
    print("\n" + "=" * 62)
    print("MANUAL MIGRATION REQUIRED")
    print("=" * 62)
    print("\nPlease run the migration SQL manually:")
    print("1. Open: https://supabase.com/dashboard/project/ipspvqidfxtixwbyrcrr/sql")
    print("2. Click 'New query'")
    print("3. Paste the contents of: backend/database/publish_invitation_migration.sql")
    print("4. Click 'Run'")
    print("\nThe migration SQL is also shown below:")
    print("-" * 62)
    print(MIGRATION_SQL)


if __name__ == "__main__":
    main()
