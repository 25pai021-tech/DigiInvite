# DigiInvite

**An AI-powered digital invitation platform.** Create beautiful invitation cards in minutes — pick a template or let AI design one, edit it in the browser, translate it into ten Indian languages, download it, or publish it as a live web page to share on WhatsApp.

🔗 **Live app:** [digiinvite.vercel.app](https://digiinvite.vercel.app)

> Built as the final project for the **M.Sc. Artificial Intelligence — AI & Entrepreneurship** course. Registered as a Micro enterprise under Udyam (UDYAM-GJ-01-0652397).

---

## ✨ Features

- **Template catalog** with a typo-tolerant, relevance-ranked search (e.g. "brithday" still finds birthday designs).
- **AI card generation** — type a short idea and a fresh card image is generated (free: 5 lifetime; Premium: unlimited).
- **In-browser editor** (Fabric.js) — edit text, fonts, colours, shapes, **icons and stickers**, with simple instructions like italic / bold / cursive.
- **10 Indian languages** — translate the card text automatically.
- **Download** as PNG, transparent PNG, JPG, or PDF.
- **Publish & share** — turn a finished card into a public web page with its own link and share it on WhatsApp (Premium).
- **Legal pages** — Privacy Policy, Terms, Refund Policy.

## 💰 Pricing model

| | Free | Premium — ₹499 one-time (lifetime) |
|---|---|---|
| Free templates | ✅ free to download | ✅ |
| AI card generations | up to 5 (lifetime) | ✅ unlimited |
| Premium templates | shown with a watermark | ✅ watermark-free |
| Remove watermark on one premium card | ₹99 per card | included |
| Publish as a web page | ❌ | ✅ |

The watermark is applied **server-side** and downloads are **locked until payment**, so a premium design cannot be exported watermark-free without paying.

---

## 🧱 Tech stack

**Frontend** — React 18 + Vite 5 · React Router 6 · Fabric.js (canvas editor) · jsPDF · qrcode · react-icons — deployed on **Vercel**.

**Backend** — FastAPI (Python) · Supabase (Postgres + Auth + Storage) · Razorpay (payments) · Cloudflare Workers AI – Stable Diffusion XL (image generation) · deep-translator + Groq (translation) — deployed on **Render**.

**Database & auth** — Supabase, secured with Row Level Security (RLS).

```
Browser (React / Vercel)
   │  REST + Supabase client (anon key)
   ▼
FastAPI API (Render) ──► Supabase (DB, Auth, Storage, service key)
   ├──► Razorpay          (orders + payment verification)
   └──► Cloudflare AI     (Stable Diffusion XL image generation)
```

---

## 📂 Project structure

```
DigiInvite/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── pages/         # Home, Editor, Dashboard, MyRequests, Pricing, PublicInvite, Legal, ...
│   │   ├── components/    # Navbar, Footer, Templates, FAQ, ...
│   │   ├── lib/           # supabaseClient, premium, publishInvitation, contentProtection, ...
│   │   └── Data/          # icon library
│   └── vercel.json        # SPA rewrite (required for client-side routing)
└── backend/               # FastAPI app
    ├── main.py            # API endpoints
    ├── db.py              # Supabase client (service key)
    ├── requirements.txt
    └── database/          # SQL migrations (run once in Supabase)
```

---

## 🚀 Getting started (local)

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- A Supabase project, a Razorpay account, and a Cloudflare Workers AI token

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Database (Supabase)
In the Supabase SQL Editor, run the migrations in `backend/database/` once:
`editor_state_migration.sql`, `publish_invitation_migration.sql`, `landing_stats_migration.sql`
(plus the `profiles` table / premium migration for Premium status).

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

---

## 🔑 Environment variables

### Backend (Render) — **secret, never commit**
| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service** key (server only) |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account id |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Workers AI token |
| `GROQ_API_KEY` / `GROQ_MODEL` | translation (optional) |
| `FRONTEND_ORIGINS` | allowed CORS origins (your Vercel URL) |

### Frontend (Vercel) — **public by design** (`VITE_` vars; set type "Config", not "Secret")
| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** key (safe; protected by RLS) |
| `VITE_API_URL` | your backend URL, e.g. `https://digiinvite.onrender.com` |
| `VITE_PUBLIC_SITE_URL` | your public site URL, e.g. `https://digiinvite.vercel.app` |

> Keep **all secrets** (Supabase service key, Razorpay secret, Cloudflare token) on the backend only. The frontend uses only the Supabase **anon** key, which is public and protected by RLS.

---

## ☁️ Deployment

- **Frontend → Vercel.** Root: `frontend`. `vercel.json` rewrites all routes to `/index.html` so deep links and page refresh work with React Router.
- **Backend → Render.** Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set the backend env vars above.
- **Database → Supabase.** Run the SQL migrations, enable RLS, and keep `profiles` read-only to clients.

---

## 🔒 Security notes

- Payments are verified server-side: each Razorpay order is re-checked (status, amount, and that it was created for that card/purpose) so one payment can't be replayed.
- Money-related columns (`status`, `generated_image_url`, `published`, `public_slug`) are backend-only; clients may update only safe fields via RLS column grants.
- The premium watermark is baked in server-side; downloads are disabled until the card is paid for or the user is Premium.

---

## 📝 License

This project was built for academic purposes as part of a college course. All rights reserved by the DigiInvite team.