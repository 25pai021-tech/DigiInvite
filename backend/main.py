import os
import io
import uuid
import requests
import urllib.parse
import bcrypt
from typing import Optional

from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, Depends, HTTPException, Header, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import supabase

# from huggingface_hub import InferenceClient   # kept for reference, not used

FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")


# ===================== TEXT DRAWING HELPER =====================

def draw_details_on_card(image, row):
    """Draws the user's details onto the card, wrapping long lines and keeping a margin."""
    draw = ImageDraw.Draw(image)
    W, H = image.size

    # keep text inside this margin (so nothing touches the border)
    margin = int(W * 0.18)          # left/right safe zone
    max_text_width = W - (margin * 2)

    title_font = ImageFont.truetype(os.path.join(FONTS_DIR, "PlayfairDisplay-Bold.ttf"), int(H * 0.06))
    sub_font   = ImageFont.truetype(os.path.join(FONTS_DIR, "Poppins-Regular.ttf"), int(H * 0.026))
    small_font = ImageFont.truetype(os.path.join(FONTS_DIR, "Poppins-Regular.ttf"), int(H * 0.022))

    text_color = (60, 40, 20)

    # --- helper: split a long string into lines that fit the width ---
    def wrap(text, font):
        words = text.split()
        lines, current = [], ""
        for word in words:
            test = (current + " " + word).strip()
            if draw.textlength(test, font=font) <= max_text_width:
                current = test
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    # --- helper: draw one line centered ---
    def centered(text, font, y):
        w = draw.textlength(text, font=font)
        draw.text(((W - w) / 2, y), text, font=font, fill=text_color)

    # --- helper: draw a wrapped block, return the new y position ---
    def draw_block(text, font, y, line_gap):
        for line in wrap(text, font):
            centered(line, font, y)
            y += line_gap
        return y

    # build the content
    title = row.get("event_name") or row.get("event_type") or "Celebration"

    date_line = ""
    if row.get("date"):
        date_line = str(row["date"])
        if row.get("time"):
            date_line += f"  •  {row['time']}"

    # start position and line spacing (relative to image height)
    y = H * 0.38
    y = draw_block(title, title_font, y, int(H * 0.07))
    y += H * 0.02

    if date_line:
        centered(date_line, sub_font, y)
        y += H * 0.055

    if row.get("venue"):
        y = draw_block(str(row["venue"]), small_font, y, int(H * 0.038))
        y += H * 0.01

    if row.get("special_message"):
        y = draw_block(str(row["special_message"]), small_font, y, int(H * 0.038))

    return image


# ===================== APP SETUP =====================

app = FastAPI(title="DigiInvite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "DigiInvite backend is running"}


# ---- check the logged-in user from their token ----
def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(401, "Missing token")
    token = authorization.replace("Bearer ", "")
    res = supabase.auth.get_user(token)
    if not res or not res.user:
        raise HTTPException(401, "Invalid token")
    return res.user


# ===================== MODELS =====================

class InvitationIn(BaseModel):
    template_id: Optional[str] = None
    event_type: str
    title: str
    event_date: Optional[str] = None
    venue: Optional[str] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    plan_tier: Optional[str] = "basic"


class RSVPIn(BaseModel):
    invitation_id: str
    guest_name: str
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    response: str          # 'yes' | 'no' | 'maybe'
    num_guests: int = 1
    message: Optional[str] = None


# ===================== CORE ENDPOINTS =====================

@app.get("/templates")
def get_templates(event_type: Optional[str] = None):
    query = supabase.table("templates").select("*").eq("is_active", True)
    if event_type:
        query = query.eq("event_type", event_type)
    return {"templates": query.execute().data}


@app.post("/submitRSVP")
def submit_rsvp(body: RSVPIn):
    result = supabase.table("rsvp").insert(body.dict()).execute()
    return {"success": True, "rsvp": result.data[0]}


@app.post("/saveInvitation")
def save_invitation(body: InvitationIn, user=Depends(get_current_user)):
    record = body.dict()
    record["user_id"] = user.id
    result = supabase.table("invitations").insert(record).execute()
    return {"success": True, "invitation": result.data[0]}


@app.post("/uploadImage")
def upload_image(file: UploadFile = File(...)):
    # make a unique filename so uploads never overwrite each other
    ext = file.filename.split(".")[-1]
    path = f"{uuid.uuid4()}.{ext}"

    file_bytes = file.file.read()
    supabase.storage.from_("images").upload(
        path,
        file_bytes,
        {"content-type": file.content_type},
    )

    url = supabase.storage.from_("images").get_public_url(path)
    return {"success": True, "path": path, "url": url}


# ===================== ADMIN ENDPOINTS =====================

class AdminLoginIn(BaseModel):
    username: str
    password: str


@app.post("/admin/login")
def admin_login(body: AdminLoginIn):
    res = supabase.table("admins").select("*").eq("username", body.username).execute()
    if not res.data:
        raise HTTPException(401, "Invalid admin credentials")
    admin = res.data[0]
    if not bcrypt.checkpw(body.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(401, "Invalid admin credentials")
    return {"success": True, "username": admin["username"]}


@app.get("/admin/requests")
def admin_list_requests():
    result = (
        supabase.table("invitation_requests")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return {"requests": result.data}


class StatusUpdateIn(BaseModel):
    request_id: str
    status: str


@app.post("/admin/updateStatus")
def admin_update_status(body: StatusUpdateIn):
    allowed = ["Pending", "Designing", "Preview Ready",
               "Revision Requested", "Approved", "Paid", "Completed"]
    if body.status not in allowed:
        raise HTTPException(400, "Invalid status")

    result = (
        supabase.table("invitation_requests")
        .update({"status": body.status})
        .eq("id", body.request_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(404, "Request not found")
    return {"success": True, "request": result.data[0]}


# ===================== AI CARD GENERATION =====================

# --- Hugging Face (kept for reference, not used) ---
# HF_TOKEN = os.environ.get("HF_TOKEN")
# IMAGE_MODEL = "black-forest-labs/FLUX.1-dev"

# ---- distinct look for each THEME (lowercase keys to match the database) ----
THEME_STYLES = {
    "royal":       "regal royal design, deep jewel tones, gold crown and crest motifs, majestic ornamental detailing",
    "floral":      "soft botanical design, hand-painted flowers, delicate leaves and vines, watercolour floral accents",
    "luxury":      "opulent luxury design, shimmering gold foil, rich textures, lavish ornate borders, premium finish",
    "modern":      "clean modern design, bold geometric shapes, sleek minimal layout, plenty of open space, contemporary",
    "traditional": "classic traditional design, ethnic Indian patterns, warm earthy tones, cultural motifs, heritage styling",
    "minimal":     "very minimal design, lots of empty white space, thin simple lines, understated, no clutter, airy",
}

# ---- distinct feel for each EVENT (lowercase keys to match the database) ----
EVENT_STYLES = {
    "wedding":      "romantic wedding invitation, intertwined rings and floral garlands, graceful elegant mood",
    "birthday":     "cheerful birthday invitation, festive celebratory mood, balloons and confetti accents",
    "engagement":   "romantic engagement invitation, ring and heart motifs, warm loving mood",
    "housewarming": "welcoming housewarming invitation, cosy home and doorway motifs, warm friendly mood",
    "baby-shower":  "gentle baby shower invitation, soft pastel tones, cute baby motifs, tender sweet mood",
    "corporate":    "professional corporate invitation, sleek business styling, refined formal mood, clean lines",
    "graduation":   "celebratory graduation invitation, graduation cap and scroll motifs, proud accomplished mood",
    "anniversary":  "romantic anniversary invitation, entwined hearts, timeless elegant mood",
    "custom":       "beautifully designed celebration invitation, tasteful decorative styling",
}


def _norm(value):
    """Make a value safe to look up: lowercase and trimmed."""
    return (value or "").strip().lower()


def find_matching_template(row):
    """Find one of Tanvi's templates that fits this request, ignoring capitalisation."""
    event_type = (row.get("event_type") or "").strip().replace("-", " ")
    theme = (row.get("theme") or "").strip()
    if not event_type:
        return None

    # first choice: same event type AND same theme (case-insensitive)
    if theme:
        res = (
            supabase.table("templates").select("*")
            .ilike("event_type", event_type)
            .ilike("theme", theme)
            .eq("is_active", True).limit(1).execute()
        )
        if res.data:
            return res.data[0]

    # fallback: any template of the same event type
    res = (
        supabase.table("templates").select("*")
        .ilike("event_type", event_type)
        .eq("is_active", True).limit(1).execute()
    )
    return res.data[0] if res.data else None


def build_prompt(r, template=None):
    theme = _norm(r.get("theme"))
    event = _norm(r.get("event_type"))

    event_words = event.replace("-", " ") or "celebration"
    theme_words = theme or "elegant"

    parts = [f"A {theme_words} {event_words} invitation card background"]

    if event in EVENT_STYLES:
        parts.append(EVENT_STYLES[event])
    if theme in THEME_STYLES:
        parts.append(THEME_STYLES[theme])
    if r.get("color"):
        parts.append(f"in a {r['color']} colour palette")
    if template:
        if template.get("religion"):
            parts.append(f"{template['religion']} cultural motifs")
        if template.get("region"):
            parts.append(f"{template['region']} regional aesthetic")
    if r.get("instructions"):
        parts.append(str(r["instructions"]))

    parts.append("decorated frame around a large empty blank centre, no text, no words, no letters, high resolution, portrait")
    return ", ".join(p for p in parts if p)


class GenerateCardIn(BaseModel):
    request_id: str


@app.post("/generateCard")
def generate_card(body: GenerateCardIn):
    # 1. get the saved request
    res = supabase.table("invitation_requests").select("*").eq("id", body.request_id).execute()
    if not res.data:
        raise HTTPException(404, "Request not found")
    row = res.data[0]

    # 2. find a matching template and build the prompt
    template = find_matching_template(row)
    prompt = build_prompt(row, template)

    # 3. generate the image
    # --- Hugging Face (kept for reference, not used) ---
    # try:
    #     client = InferenceClient(api_key=HF_TOKEN)
    #     image = client.text_to_image(prompt, model=IMAGE_MODEL)
    #     image = draw_details_on_card(image, row)
    # except Exception as e:
    #     raise HTTPException(502, f"Image generation failed: {e}")

    # --- Pollinations.ai (current) ---
    try:
        model = "flux"   # "flux" or "nanobanana"
        encoded_prompt = urllib.parse.quote(prompt)
        pollinations_url = (
            f"https://image.pollinations.ai/prompt/{encoded_prompt}"
            f"?width=1024&height=1024&model={model}&nologo=true"
        )
        resp = requests.get(pollinations_url, timeout=120)
        resp.raise_for_status()
        image = Image.open(io.BytesIO(resp.content))
        image = draw_details_on_card(image, row)
    except Exception as e:
        raise HTTPException(502, f"Image generation failed: {e}")

    # 4. convert to PNG bytes
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    image_bytes = buf.getvalue()

    # 5. save to Supabase Storage
    path = f"generated/{body.request_id}.png"
    supabase.storage.from_("design-uploads").upload(
        path, image_bytes, {"content-type": "image/png", "upsert": "true"}
    )
    image_url = supabase.storage.from_("design-uploads").get_public_url(path)

    # 6. store the link on the request
    supabase.table("invitation_requests").update(
        {"generated_image_url": image_url}
    ).eq("id", body.request_id).execute()

    return {"success": True, "prompt": prompt, "image_url": image_url}