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

from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, Depends, HTTPException, Header, File, UploadFile
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================== RAZORPAY SETUP =====================

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


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
    amount: int          # rupees, e.g. 499


class VerifyPaymentIn(BaseModel):
    request_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class TranslateIn(BaseModel):
    texts: List[str]
    source_lang: Optional[str] = "en"
    target_lang: str


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
        "amount": body.amount * 100,
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
                _translation_cache[(texts[i], source, target)] = val
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
        if template.get("colors"):
            parts.append(f"colour palette of {template['colors']}")
        if template.get("style_keywords"):
            parts.append(str(template["style_keywords"]))
        if template.get("motifs"):
            parts.append(f"featuring {template['motifs']}")
        if template.get("mood"):
            parts.append(f"{template['mood']} mood")
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
        # image = draw_details_on_card(image, row)  # keep this commented
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