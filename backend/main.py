import os
import json
import io
import uuid
import requests
import urllib.parse
import bcrypt
from typing import Optional, List
import time
from deep_translator import GoogleTranslator
import razorpay
import hmac
import hashlib
import base64

import re
import random
import string
from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, Depends, HTTPException, Header, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import supabase



# from huggingface_hub import InferenceClient   # kept for reference, not used

FONTS_DIR = os.path.join(os.path.dirname(__file__), "fonts")


# ===================== TEXT DRAWING HELPER =====================
# (currently unused — kept for future "burn text onto card" feature)

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

# Allowed browser origins. Local dev defaults are always included; add your
# deployed frontend URL(s) via the FRONTEND_ORIGINS env var (comma-separated),
# e.g.  FRONTEND_ORIGINS=https://digiinvite.vercel.app
_default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
_env_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = _default_origins + _env_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================== RAZORPAY SETUP =====================

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
INVITATION_PRICE_RUPEES = 99
PREMIUM_PRICE_RUPEES = 499          # one-time lifetime Premium
FREE_AI_GENERATION_LIMIT = 5        # free users get 5 AI generations total

def _now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

def get_or_create_profile(user_id: str) -> dict:
    if not user_id:
        return {"id": None, "is_premium": False, "ai_generations_used": 0}
    res = supabase.table("profiles").select("*").eq("id", user_id).limit(1).execute()
    if res.data:
        return res.data[0]
    try:
        created = supabase.table("profiles").insert({"id": user_id}).execute()
        if created.data:
            return created.data[0]
    except Exception as e:
        print(f"[profiles] create failed: {e}")
    return {"id": user_id, "is_premium": False, "ai_generations_used": 0}


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


class CreateOrderIn(BaseModel):
    request_id: str


class VerifyPaymentIn(BaseModel):
    request_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class TranslateIn(BaseModel):
    texts: List[str]
    source_lang: Optional[str] = "en"
    target_lang: str


class PublishInvitationIn(BaseModel):
    request_id: str
    custom_slug: Optional[str] = None


class EventPhotoIn(BaseModel):
    photo_url: str
    caption: Optional[str] = None
    uploaded_by: Optional[str] = "Guest"

class VerifyPremiumIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


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


# ===================== PAYMENTS =====================

@app.post("/createOrder")
def create_order(body: CreateOrderIn, user=Depends(get_current_user)):
    # Make sure this request belongs to the logged-in user
    req = (
        supabase.table("invitation_requests")
        .select("id, user_id")
        .eq("id", body.request_id)
        .limit(1)
        .execute()
    )
    if not req.data or req.data[0]["user_id"] != user.id:
        raise HTTPException(404, "Request not found")

    # Razorpay works in paise, so multiply rupees by 100
    order = razorpay_client.order.create({
        "amount": INVITATION_PRICE_RUPEES * 100,
        "currency": "INR",
        "receipt": body.request_id,
        "notes": {"request_id": body.request_id},
    })

    # Send what the frontend popup needs
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": RAZORPAY_KEY_ID,
    }


@app.post("/verifyPayment")
def verify_payment(body: VerifyPaymentIn, user=Depends(get_current_user)):
    # 1) Verify the signature — this proves the payment is real and untampered.
    #    Razorpay signs (order_id + "|" + payment_id) with your secret key.
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(400, "Payment verification failed")

    # 2) Signature is valid → mark THIS user's request as Paid
    result = (
        supabase.table("invitation_requests")
        .update({"status": "Paid"})
        .eq("id", body.request_id)
        .eq("user_id", user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(404, "Request not found")

    return {"success": True, "status": "Paid", "request": result.data[0]}

@app.get("/me/premium")
def my_premium(user=Depends(get_current_user)):
    p = get_or_create_profile(user.id)
    return {
        "is_premium": bool(p.get("is_premium")),
        "ai_generations_used": int(p.get("ai_generations_used") or 0),
        "free_limit": FREE_AI_GENERATION_LIMIT,
    }


@app.post("/createPremiumOrder")
def create_premium_order(user=Depends(get_current_user)):
    order = razorpay_client.order.create({
        "amount": PREMIUM_PRICE_RUPEES * 100,
        "currency": "INR",
        "receipt": f"premium_{user.id}"[:40],
        "notes": {"purpose": "premium", "user_id": user.id},
    })
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": RAZORPAY_KEY_ID,
    }


@app.post("/verifyPremiumPayment")
def verify_premium_payment(body: VerifyPremiumIn, user=Depends(get_current_user)):
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(400, "Payment verification failed")

    get_or_create_profile(user.id)
    supabase.table("profiles").update({
        "is_premium": True,
        "premium_since": _now_iso(),
        "updated_at": _now_iso(),
    }).eq("id", user.id).execute()
    return {"success": True, "is_premium": True}


# ===================== TRANSLATION =====================

# in-memory cache: survives until you restart the server
_translation_cache = {}


def _translate_one(text, source, target, retries=4):
    """Fallback: translate a single string with Google, retrying on rate limits."""
    key = (text, source, target)
    if key in _translation_cache:
        return _translation_cache[key]

    for attempt in range(retries):
        try:
            result = GoogleTranslator(source=source, target=target).translate(text)
            if result and result.strip():
                _translation_cache[key] = result

                return result
        except Exception:
            pass
        if attempt < retries - 1:
            time.sleep(0.7 * (attempt + 1))   # back off a bit more each retry

    # every attempt failed → keep the original so nothing breaks
    return text


# ---------- LLM (context-aware) translation via Groq ----------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

_LANG_NAMES = {
    "hi": "Hindi", "gu": "Gujarati", "ml": "Malayalam", "ta": "Tamil",
    "te": "Telugu", "mr": "Marathi", "bn": "Bengali", "pa": "Punjabi",
    "kn": "Kannada", "en": "English",
}


def _llm_translate(texts, target):
    """Translate a whole card together, with context. Returns an aligned list, or None on failure."""
    if not GROQ_API_KEY:
        print("[translate] No GROQ_API_KEY set → falling back to Google")
        return None
    lang = _LANG_NAMES.get(target, target)
    numbered = "\n".join(f"{i+1}. {t}" for i, t in enumerate(texts))
    prompt = (
        f"These are text lines from a digital event invitation card. "
        f"Rewrite every line fully in {lang} script as it would naturally appear on an invitation. "
        f"Translate the MEANING of every ordinary word into its real {lang} word — for example "
        f"'City' becomes the {lang} word for city, 'Street' becomes the {lang} word for street, "
        f"'Birthday' becomes the {lang} word for birthday. Do not spell English words phonetically "
        f"when a real {lang} word exists. "
        f"Also translate the phrase 'request your company' as requesting someone's presence, not a business. "
        f"Keep UNCHANGED only: digits and numbers, phone numbers, email addresses, website links, "
        f"and the acronym 'RSVP'. Translate EVERY other word by its dictionary meaning into {lang} — "
        f"including placeholder words used as names (translate 'Anywhere' to the {lang} word meaning "
        f"'anywhere', 'Any' to the word for 'any'). Never spell an English word phonetically if it "
        f"has a real {lang} meaning. "
        f"ALWAYS write people's names in {lang} script by transliterating their sound "
        f"(for example write 'Olivia' and 'Alexander' in {lang} letters). Never leave a name in "
        f"English/Latin letters. "
        f'Return ONLY a JSON object like {{"translations": [...]}} with exactly one translated '
        f"string per input line, in the same order.\n\nLines:\n{numbered}"
    )
    try:
        resp = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0,
                "response_format": {"type": "json_object"},
            },
            timeout=15,
        )
        if resp.status_code != 200:
            print(f"[translate] Groq error {resp.status_code}: {resp.text[:300]}")
            return None
        content = resp.json()["choices"][0]["message"]["content"]
        arr = json.loads(content).get("translations")
        if isinstance(arr, list) and len(arr) == len(texts):
            print(f"[translate] ✅ LLM translated {len(arr)} lines to {lang}")
            return [str(x) for x in arr]
        print(f"[translate] LLM returned unexpected shape: {content[:200]}")
    except Exception as e:
        print(f"[translate] Groq call failed: {e}")
    return None

def _translate_batch(texts, source, target):
    results = list(texts)
    pending, pending_idx = [], []

    for i, t in enumerate(texts):
        if not t or not t.strip():
            continue
        key = (t, source, target)
        if key in _translation_cache:
            results[i] = _translation_cache[key]
        else:
            pending.append(t)
            pending_idx.append(i)

    if not pending:
        return results

    # 1) Context-aware LLM translation for the whole card
    llm = _llm_translate(pending, target)
    if llm:
        for j, i in enumerate(pending_idx):
            val = (llm[j] or "").strip() or texts[i]
            results[i] = val
            _translation_cache[(texts[i], source, target)] = val
        return results

    # 2) Fallback: Google in one combined call
    SEP = "\n"
    try:
        out = GoogleTranslator(source=source, target=target).translate(SEP.join(pending))
        parts = out.split(SEP) if out else []
        if len(parts) == len(pending):
            for j, i in enumerate(pending_idx):
                val = parts[j].strip() or texts[i]
                results[i] = val
                _translation_cache[(texts[i], source, target)] = val
            return results
    except Exception:
        pass

    # 3) Last resort: Google per-item with retries
    for j, i in enumerate(pending_idx):
        results[i] = _translate_one(texts[i], source, target)
    return results


@app.post("/translate")
def translate(body: TranslateIn):
    if body.target_lang == body.source_lang:
        return {"translations": body.texts}
    return {"translations": _translate_batch(body.texts, body.source_lang, body.target_lang)}


# ===================== INVITATIONS / UPLOADS =====================

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


# ===================== PUBLISH INVITATION & PUBLIC MINI-WEBSITE =====================

@app.post("/publishInvitation")
def publish_invitation(body: PublishInvitationIn):
    # Retrieve request
    req = supabase.table("invitation_requests").select("*").eq("id", body.request_id).limit(1).execute()
    if not req.data:
        raise HTTPException(404, "Invitation not found")
    row = req.data[0]

    # Generate or sanitize slug
    slug = (body.custom_slug or "").strip().lower()
    if slug:
        slug = re.sub(r'[^a-z0-9-]', '-', slug).strip('-')
    if not slug:
        base_name = row.get("event_name") or row.get("event_type") or "invite"
        base_clean = re.sub(r'[^a-zA-Z0-9\s-]', '', base_name).strip().lower()
        base_clean = re.sub(r'[\s_]+', '-', base_clean)[:30].rstrip('-') or "invite"
        rand_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
        slug = f"{base_clean}-{rand_suffix}"

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Update editor_state as a guarantee/fallback if columns don't exist yet
    editor_state = row.get("editor_state") or {}
    if isinstance(editor_state, str):
        try:
            editor_state = json.loads(editor_state)
        except Exception:
            editor_state = {}
    elif not isinstance(editor_state, dict):
        editor_state = {}

    editor_state["publish_info"] = {
        "public_slug": slug,
        "published": True,
        "published_at": now_iso
    }

    # Attempt to update dedicated columns and editor_state
    try:
        supabase.table("invitation_requests").update({
            "public_slug": slug,
            "published": True,
            "published_at": now_iso,
            "editor_state": editor_state
        }).eq("id", body.request_id).execute()
    except Exception as e:
        print(f"[publish] Column update failed, updating editor_state only: {e}")
        supabase.table("invitation_requests").update({
            "editor_state": editor_state
        }).eq("id", body.request_id).execute()

    return {
        "success": True,
        "public_slug": slug,
        "published": True,
        "published_at": now_iso,
        "request_id": body.request_id,
        "public_url": f"/invite/{slug}"
    }


@app.get("/publicInvite/{slug}")
def get_public_invite(slug: str):
    clean_slug = slug.strip().lower()
    inv = None

    # 1. Try querying by dedicated column
    try:
        res = supabase.table("invitation_requests").select("*").eq("public_slug", clean_slug).execute()
        if res.data:
            inv = res.data[0]
    except Exception as e:
        print(f"[publicInvite] Column select error: {e}")

    # 2. Fallback: inspect requests for publish_info in editor_state
    if not inv:
        try:
            all_res = supabase.table("invitation_requests").select("*").execute()
            for r in (all_res.data or []):
                st = r.get("editor_state")
                if isinstance(st, str):
                    try:
                        st = json.loads(st)
                    except Exception:
                        st = {}
                if isinstance(st, dict):
                    pinfo = st.get("publish_info", {})
                    if pinfo.get("public_slug") == clean_slug:
                        inv = r
                        inv["published"] = pinfo.get("published", True)
                        inv["published_at"] = pinfo.get("published_at")
                        inv["public_slug"] = clean_slug
                        break
        except Exception as e:
            print(f"[publicInvite] Fallback search error: {e}")

    if not inv:
        raise HTTPException(404, "Invitation not found")

    is_published = inv.get("published")
    if is_published is None:
        st = inv.get("editor_state")
        if isinstance(st, str):
            try:
                st = json.loads(st)
            except Exception:
                st = {}
        if isinstance(st, dict):
            is_published = st.get("publish_info", {}).get("published", False)

    if not is_published:
        raise HTTPException(403, "This invitation is not published yet")

    # Fetch event photos
    photos = []
    try:
        photo_res = supabase.table("event_photos").select("*").eq("invitation_id", inv["id"]).order("created_at", desc=True).execute()
        photos = photo_res.data or []
    except Exception as e:
        print(f"[publicInvite] Photo table query error: {e}")
        st = inv.get("editor_state")
        if isinstance(st, str):
            try:
                st = json.loads(st)
            except Exception:
                st = {}
        if isinstance(st, dict):
            photos = st.get("event_photos", [])

    return {
        "success": True,
        "invitation": inv,
        "photos": photos
    }


@app.post("/publicInvite/{slug}/uploadPhoto")
async def upload_event_photo(
    slug: str,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    uploaded_by: Optional[str] = Form("Guest")
):
    clean_slug = slug.strip().lower()
    inv_data = get_public_invite(clean_slug)
    inv = inv_data["invitation"]
    inv_id = inv["id"]

    ext = (file.filename or "photo.jpg").split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        ext = "jpg"
    filename = f"{inv_id}/{uuid.uuid4()}.{ext}"

    content = await file.read()
    content_type = file.content_type or f"image/{ext}"

    bucket = "event-photos"
    try:
        supabase.storage.from_(bucket).upload(
            filename,
            content,
            {"content-type": content_type, "upsert": "true"}
        )
    except Exception as e:
        print(f"[photoUpload] bucket {bucket} failed: {e}, falling back to design-uploads")
        bucket = "design-uploads"
        supabase.storage.from_(bucket).upload(
            filename,
            content,
            {"content-type": content_type, "upsert": "true"}
        )

    pub_url = supabase.storage.from_(bucket).get_public_url(filename)

    photo_record = {
        "invitation_id": inv_id,
        "photo_url": pub_url,
        "caption": caption or "",
        "uploaded_by": uploaded_by or "Guest",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    try:
        db_res = supabase.table("event_photos").insert(photo_record).execute()
        if db_res.data:
            photo_record = db_res.data[0]
    except Exception as e:
        print(f"[photoUpload] Table insert failed, storing in editor_state: {e}")
        st = inv.get("editor_state") or {}
        if isinstance(st, str):
            try:
                st = json.loads(st)
            except Exception:
                st = {}
        curr_photos = st.get("event_photos", [])
        photo_record["id"] = str(uuid.uuid4())
        curr_photos.insert(0, photo_record)
        st["event_photos"] = curr_photos
        supabase.table("invitation_requests").update({"editor_state": st}).eq("id", inv_id).execute()

    return {"success": True, "photo": photo_record}


@app.get("/publicInvite/{slug}/photos")
def get_event_photos(slug: str):
    clean_slug = slug.strip().lower()
    inv_data = get_public_invite(clean_slug)
    inv = inv_data["invitation"]
    try:
        photo_res = supabase.table("event_photos").select("*").eq("invitation_id", inv["id"]).order("created_at", desc=True).execute()
        return {"photos": photo_res.data or []}
    except Exception as e:
        st = inv.get("editor_state")
        if isinstance(st, str):
            try:
                st = json.loads(st)
            except Exception:
                st = {}
        return {"photos": st.get("event_photos", []) if isinstance(st, dict) else []}


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
    allowed = ["Pending", "Draft", "Paid", "Completed"]
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
    if row.get("template_id"):
        res = (
            supabase.table("templates").select("*")
            .eq("id", row["template_id"])
            .eq("is_active", True).limit(1).execute()
        )
        if res.data:
            return res.data[0]

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

    # If the user specified a custom theme, do not fall back to an arbitrary
    # template that would inject conflicting cultural/religious motifs.
    norm_theme = _norm(theme)
    if norm_theme and norm_theme not in THEME_STYLES and norm_theme != "custom":
        return None

    # fallback: any template of the same event type
    res = (
        supabase.table("templates").select("*")
        .ilike("event_type", event_type)
        .eq("is_active", True).limit(1).execute()
    )
    return res.data[0] if res.data else None


def build_prompt(r, template=None):
    raw_theme = (r.get("theme") or "").strip()
    theme = _norm(raw_theme)
    event = _norm(r.get("event_type"))
    event_words = event.replace("-", " ") or "celebration"

    theme_motifs = {
        "royal": "regal gold crown and crest motifs, deep jewel tones, ornate detailing",
        "floral": "hand-painted flowers, delicate leaves and vines, watercolour botanical accents",
        "luxury": "shimmering gold foil accents, rich textures, lavish ornate corners",
        "modern": "clean geometric shapes, sleek minimal decorative accents",
        "traditional": "ethnic Indian patterns, warm earthy tones, cultural decorative motifs",
        "minimal": "thin simple decorative lines, lots of empty white space, airy",
    }
    event_motifs = {
        "wedding": "subtle ring and heart accents",
        "birthday": "balloons and confetti accents",
        "engagement": "ring and heart accents",
        "housewarming": "cosy home accents",
        "baby-shower": "soft pastel baby accents",
        "corporate": "clean professional accents",
        "graduation": "graduation cap and scroll accents",
        "anniversary": "entwined hearts accents",
    }

    # A custom theme is anything not in our preset list (e.g. "space", "vintage").
    is_custom = bool(raw_theme and theme not in theme_motifs and theme != "custom")

    if is_custom:
        # Make the custom theme DOMINANT so event/template motifs don't drown it.
        parts = [
            f"A decorative {raw_theme} themed border and background artwork for a {event_words} celebration",
            f"strong {raw_theme} theme: {raw_theme} inspired motifs, colours, textures and atmosphere filling the entire border",
            f"clearly and obviously {raw_theme} themed",
            "an elegant frame surrounding a completely empty blank center",
        ]
        if event == "wedding":
            parts.append("with subtle romantic accents")
    else:
        parts = [
            f"An ornamental decorative border and background artwork for a {event_words} celebration",
            "an elegant decorative frame surrounding a completely empty blank center",
        ]
        if event in event_motifs:
            parts.append(event_motifs[event])
        if theme in theme_motifs:
            parts.append(theme_motifs[theme])

    if r.get("color"):
        parts.append(f"in a {r['color']} colour palette")

    # Skip template motifs for custom themes — they conflict with the theme.
    if template and not is_custom:
        if template.get("colors"):
            parts.append(f"colour palette of {template['colors']}")
        if template.get("motifs"):
            parts.append(f"decorated with {template['motifs']}")

    if r.get("couple_photo_url"):
        parts.append("with an empty blank frame in the middle for placing a photo, no people, no faces")

    parts.append(
        "the entire center is empty blank negative space, "
        "absolutely NO text, NO letters, NO words, NO writing, NO calligraphy, NO numbers, "
        "NO printed card, NO poster, NO paper document, NO people, NO faces, "
        "only a decorative border with an empty middle area, high resolution"
    )
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

    # --- Cloudflare Workers AI (Stable Diffusion XL) ---
    CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
    CF_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0"
    cf_url = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/ai/run/{CF_MODEL}"

    negative_prompt = (
        "text, words, letters, writing, calligraphy, numbers, typography, caption, title, "
        "printed invitation, invitation card, poster, paper, document, label, "
        "watermark, signature, logo, "
        "people, person, human, man, woman, face, portrait, child, crowd"
    )

    image = None
    last_err = None
    for attempt in range(3):
        try:
            resp = requests.post(
                cf_url,
                headers={"Authorization": f"Bearer {CF_API_TOKEN}"},
                json={
                    "prompt": prompt,
                    "negative_prompt": negative_prompt,
                    "width": 1024,
                    "height": 1024,
                },
                timeout=120,
            )
            resp.raise_for_status()
            image = Image.open(io.BytesIO(resp.content))   # SDXL returns raw PNG bytes
            break
        except Exception as e:
            last_err = e
            print(f"[cloudflare] attempt {attempt+1} failed: {e}")
            time.sleep(2 * (attempt + 1))

    if image is None:
        raise HTTPException(502, f"Image generation failed: {last_err}")
    # image = draw_details_on_card(image, row)  # keep this commented

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

