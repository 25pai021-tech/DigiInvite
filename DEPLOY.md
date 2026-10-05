# DigiInvite — Deploy & Live Payments Guide

Stack: Frontend (React/Vite) on **Vercel**, Backend (FastAPI) on **Render**,
database/auth/storage on **Supabase** (already hosted).

---
## STEP 1 — Razorpay (start today; approval takes 2–4 working days)
1. Dashboard → **Settings → Account Activation**. Submit KYC: PAN, bank account,
   business type ("Individual" is fine for a student).
2. Meanwhile, grab your **TEST keys**: Settings → API Keys → Generate Test Keys.
   You get `rzp_test_...` (key id) and a secret. Use these for all testing.
3. When KYC is approved, generate **LIVE keys** (`rzp_live_...`). You only swap
   two env vars later — no code change.

> Safety net: TEST mode looks identical in a demo. If LIVE isn't approved by the
> 15th, demo in TEST mode — the examiner sees the same UPI/card popup.

---
## STEP 2 — Push to GitHub
From the project root:
```
git init
git add .
git commit -m "Deploy-ready: env-based API URL + CORS"
git branch -M main
git remote add origin https://github.com/<you>/DigiInvite.git
git push -u origin main
```
(`.env` and `.venv/` are gitignored, so no secrets are pushed.)

---
## STEP 3 — Backend on Render
1. render.com → New → **Web Service** → connect your repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
3. **Environment** tab → add (from backend/.env.example):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`  (test keys for now)
   - `GROQ_API_KEY`, `GROQ_MODEL` (optional)
   - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (optional)
   - Leave `FRONTEND_ORIGINS` empty for now (fill in Step 5)
4. Deploy. Note your URL, e.g. `https://digiinvite-api.onrender.com`.
5. Test it: open `https://<your-api>.onrender.com/templates` — should return JSON.

> Free tier sleeps after 15 min idle (first hit ~50s). Before your review, open
> the API once to wake it.

---
## STEP 4 — Frontend on Vercel
1. vercel.com → New Project → import the same repo.
2. Settings:
   - **Root Directory:** `frontend`
   - Framework preset: **Vite** (auto). Build: `npm run build`, Output: `dist`
3. **Environment Variables** → add (from frontend/.env.example):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = your Render URL from Step 3 (e.g. `https://digiinvite-api.onrender.com`)
4. Deploy. Note your URL, e.g. `https://digiinvite.vercel.app`.

---
## STEP 5 — Connect them (CORS)
1. Render → backend → Environment → set
   `FRONTEND_ORIGINS=https://digiinvite.vercel.app` (your real Vercel URL).
2. Save → Render redeploys. Now the browser can call the API.

---
## STEP 6 — Test the whole flow (TEST keys)
On your live Vercel URL: sign up → pick a template → editor → Pay → Razorpay
popup → pay with a **test UPI/card** (Razorpay docs: "success@razorpay" UPI or
test card 4111 1111 1111 1111) → verify → delivery. Fix anything that breaks.

---
## STEP 7 — Go live
1. When Razorpay KYC is approved, generate LIVE keys.
2. Render → Environment → replace `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` with
   the `rzp_live_...` values → redeploy.
3. Make ONE real ₹99 payment end-to-end, then refund it from the Razorpay
   dashboard. Done — live payments working.
