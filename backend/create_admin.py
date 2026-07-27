import sys
import bcrypt
from db import supabase

# defaults — or pass your own:  python create_admin.py myusername mypassword
username = "admin"
password = "digiinvite@admin123"
if len(sys.argv) >= 3:
    username, password = sys.argv[1], sys.argv[2]

password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

supabase.table("admins").upsert(
    {"username": username, "password_hash": password_hash},
    on_conflict="username",
).execute()

print(f"Admin '{username}' saved to the database.")