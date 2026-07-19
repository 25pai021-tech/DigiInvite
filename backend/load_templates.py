import csv, io, os
from PIL import Image
from db import supabase

BUCKET = "templates"
FOLDER = "template_uploads"

def upload(path_in_bucket, image_bytes):
    supabase.storage.from_(BUCKET).upload(
        path_in_bucket,
        image_bytes,
        {"content-type": "image/png", "upsert": "true"},
    )
    return supabase.storage.from_(BUCKET).get_public_url(path_in_bucket)

with open("templates.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(f"Found {len(rows)} templates in the sheet.\n")

for row in rows:
    filename = row["filename"].strip()
    local_path = os.path.join(FOLDER, filename)

    if not os.path.exists(local_path):
        print(f"SKIPPED (file missing): {filename}")
        continue

    # --- full-size image ---
    with open(local_path, "rb") as img_file:
        full_bytes = img_file.read()
    full_url = upload(f"full/{filename}", full_bytes)

    # --- thumbnail ---
    img = Image.open(local_path)
    img.thumbnail((400, 500))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="PNG", optimize=True)
    thumb_url = upload(f"thumb/{filename}", buf.getvalue())

    # --- database row ---
    record = {
        "name": row["name"].strip(),
        "event_type": row["event_type"].strip(),
        "theme": row["theme"].strip(),
        "religion": row.get("religion", "").strip() or None,
        "region": row.get("region", "").strip() or None,
        "language": row.get("language", "").strip() or "English",
        "tier": row["tier"].strip().lower(),
        "thumbnail_url": thumb_url,
        "config": {"full_image_url": full_url},
        "is_active": True,
    }

    supabase.table("templates").insert(record).execute()
    print(f"LOADED: {record['name']}")

print("\nDone.")