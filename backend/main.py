import os
import io
from huggingface_hub import InferenceClient
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from db import supabase
from fastapi import File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uuid
import bcrypt


app = FastAPI(title="DigiInvite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# quick test route
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

# ---- the data we expect to receive ----
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

# ---- endpoint 1: get all templates (easiest) ----
@app.get("/templates")
def get_templates(event_type: Optional[str] = None):
    query = supabase.table("templates").select("*").eq("is_active", True)
    if event_type:
        query = query.eq("event_type", event_type)
    return {"templates": query.execute().data}

# ---- endpoint 2: guest submits an RSVP (public) ----
@app.post("/submitRSVP")
def submit_rsvp(body: RSVPIn):
    result = supabase.table("rsvp").insert(body.dict()).execute()
    return {"success": True, "rsvp": result.data[0]}

# ---- endpoint 3: save an invitation (needs login) ----
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

    # get a link the frontend can use to show the image
    url = supabase.storage.from_("images").get_public_url(path)
    return {"success": True, "path": path, "url": url}


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


# ---- ADMIN: list every invitation request ----
@app.get("/admin/requests")
def admin_list_requests():
    result = (
        supabase.table("invitation_requests")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return {"requests": result.data}

# ---- ADMIN: change a request's status ----
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


HF_TOKEN = os.environ.get("HF_TOKEN")
IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell"   # fast, free-friendly image model

def build_prompt(r):
    parts = [f"An elegant {r.get('theme') or ''} {r.get('event_type') or 'event'} invitation card"]
    if r.get("bride_name") and r.get("groom_name"):
        parts.append(f"celebrating {r['bride_name']} and {r['groom_name']}")
    elif r.get("event_name"):
        parts.append(f"for {r['event_name']}")
    if r.get("color"):
        parts.append(f"in a {r['color']} colour palette")
    if r.get("instructions"):
        parts.append(str(r["instructions"]))
    parts.append("intricate decorative borders, beautiful typography, premium stationery style, high resolution, centered composition")
    return ", ".join(p for p in parts if p)

class GenerateCardIn(BaseModel):
    request_id: str

@app.post("/generateCard")
def generate_card(body: GenerateCardIn):
    if not HF_TOKEN:
        raise HTTPException(500, "HF_TOKEN is not set in the backend .env file")

    # 1. get the saved request
    res = supabase.table("invitation_requests").select("*").eq("id", body.request_id).execute()
    if not res.data:
        raise HTTPException(404, "Request not found")
    row = res.data[0]

    # 2. build the detailed prompt from the form fields
    prompt = build_prompt(row)

    # 3. ask Hugging Face to generate the image
    try:
        client = InferenceClient(api_key=HF_TOKEN)
        image = client.text_to_image(prompt, model=IMAGE_MODEL)   # returns a PIL image
    except Exception as e:
        raise HTTPException(502, f"Image generation failed: {e}")

    # 4. turn the image into PNG bytes
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    image_bytes = buf.getvalue()

    # 5. save it to Supabase Storage
    path = f"generated/{body.request_id}.png"
    supabase.storage.from_("design-uploads").upload(
        path, image_bytes, {"content-type": "image/png", "upsert": "true"}
    )
    url = supabase.storage.from_("design-uploads").get_public_url(path)

    # 6. store the image link on the request
    supabase.table("invitation_requests").update(
        {"generated_image_url": url}
    ).eq("id", body.request_id).execute()

    return {"success": True, "prompt": prompt, "image_url": url}