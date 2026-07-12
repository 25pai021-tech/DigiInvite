from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from db import supabase

app = FastAPI(title="DigiInvite API")

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