# DigiInvite – Complete Setup Guide
## How to install, place files, and run the project

---

## STEP 1 — Your Final Folder Structure

Place every file exactly as shown below inside your
`DigiInvite/frontend/` folder:

```
DigiInvite/
└── frontend/
    │
    ├── index.html                          ← Replace existing file
    ├── vite.config.js                      ← Replace existing file
    ├── package.json                        ← Replace existing file
    │
    └── src/
        │
        ├── main.jsx                        ← Entry point
        ├── App.jsx                         ← Router + layout
        │
        ├── styles/
        │   └── global.css                  ← Theme tokens + resets
        │
        ├── contexts/
        │   └── ThemeContext.jsx            ← Light/dark mode state
        │
        ├── components/
        │   ├── Navbar/
        │   │   ├── Navbar.jsx
        │   │   └── Navbar.css
        │   │
        │   ├── Hero/
        │   │   ├── Hero.jsx
        │   │   └── Hero.css
        │   │
        │   ├── Stats/
        │   │   ├── Stats.jsx
        │   │   └── Stats.css
        │   │
        │   ├── Features/
        │   │   ├── Features.jsx
        │   │   └── Features.css
        │   │
        │   ├── HowItWorks/
        │   │   ├── HowItWorks.jsx
        │   │   └── HowItWorks.css
        │   │
        │   ├── Templates/
        │   │   ├── Templates.jsx
        │   │   └── Templates.css
        │   │
        │   ├── Testimonials/
        │   │   ├── Testimonials.jsx
        │   │   └── Testimonials.css
        │   │
        │   ├── FAQ/
        │   │   ├── FAQ.jsx
        │   │   └── FAQ.css
        │   │
        │   ├── BadgeStrip/
        │   │   ├── BadgeStrip.jsx
        │   │   └── BadgeStrip.css
        │   │
        │   ├── CTASection/
        │   │   ├── CTASection.jsx
        │   │   └── CTASection.css
        │   │
        │   └── Footer/
        │       ├── Footer.jsx
        │       └── Footer.css
        │
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Auth.css
            ├── Dashboard.jsx
            └── Dashboard.css
```

---

## STEP 2 — Install Dependencies

Open your terminal, navigate to the frontend folder, and run:

```bash
cd DigiInvite/frontend
npm install
```

This installs:
- React 18
- React Router DOM 6
- Vite + plugin-react

---

## STEP 3 — Start the Development Server

```bash
npm run dev
```

Your browser will open at **http://localhost:5173**

You should see:
✅ DigiInvite landing page with light/dark mode toggle
✅ Floating invitation cards in the hero
✅ All sections: Stats, Features, How It Works, Templates, Testimonials, FAQ, Footer
✅ Working navigation between pages

---

## STEP 4 — What Each File Does

| File | Purpose |
|------|---------|
| `index.html` | Vite root HTML — the shell that loads React |
| `main.jsx` | Mounts the React app into `#root` |
| `App.jsx` | Sets up routing + wraps everything in ThemeProvider |
| `ThemeContext.jsx` | Manages light/dark mode, saves preference to localStorage |
| `global.css` | All CSS variables (colours, spacing), resets, typography |
| `Home.jsx` | The landing page — imports all section components |
| `Navbar.jsx` | Fixed top nav with theme toggle + responsive hamburger menu |
| `Hero.jsx` | Hero section with floating invitation cards |
| `Stats.jsx` | Stats bar (0+ templates, 0+ cards, 20+ events) |
| `Features.jsx` | "Why DigiInvite" 6-feature grid |
| `HowItWorks.jsx` | 4-step process section |
| `Templates.jsx` | Template gallery with filter buttons |
| `Testimonials.jsx` | 3 testimonial cards |
| `FAQ.jsx` | Accordion FAQ |
| `BadgeStrip.jsx` | Trust badges strip |
| `CTASection.jsx` | Final call-to-action |
| `Footer.jsx` | Footer with links and social icons |
| `Login.jsx` | Login form (Supabase auth to be wired later) |
| `Register.jsx` | Register form (Supabase auth to be wired later) |
| `Dashboard.jsx` | User dashboard (to be expanded later) |

---

## STEP 5 — Upcoming Development (Next Steps)

Once the homepage is running, here is the order to build next:

### Phase 2 — Authentication
- [ ] Install Supabase: `npm install @supabase/supabase-js`
- [ ] Create `src/supabase/client.js` with your Supabase URL + anon key
- [ ] Wire Login.jsx and Register.jsx to Supabase Auth
- [ ] Add Google OAuth login
- [ ] Protect the `/dashboard` route (redirect if not logged in)

### Phase 3 — Template Gallery Page
- [ ] Build `/templates` full page with real template data
- [ ] Load templates from Supabase `templates` table
- [ ] Implement search + filter

### Phase 4 — AI Generator
- [ ] Build the event selection screen (wedding, birthday, etc.)
- [ ] Build the invitation details form
- [ ] Connect to Gemini / OpenAI API (mock first)
- [ ] Auto-fill a template with entered details

### Phase 5 — Fabric.js Editor
- [ ] Install: `npm install fabric`
- [ ] Build the canvas editor page
- [ ] Text editing, image upload, color/font controls
- [ ] Save canvas JSON to Supabase

### Phase 6 — RSVP + QR Code
- [ ] Generate unique RSVP link per invitation
- [ ] Build public RSVP page
- [ ] Install `qrcode.react`: `npm install qrcode.react`
- [ ] Show QR in editor and download

### Phase 7 — Payments
- [ ] Add Razorpay script
- [ ] Build `/pricing` page
- [ ] Integrate Razorpay checkout
- [ ] Save payment status to Supabase
- [ ] Remove watermark after payment

### Phase 8 — Download System
- [ ] PNG/JPEG: use Fabric.js `canvas.toDataURL()`
- [ ] PDF: install `jsPDF`: `npm install jspdf`
- [ ] Instagram Story format (1080×1920)

---

## STEP 6 — Git Commands (Push to GitHub)

```bash
# From DigiInvite/frontend/
git add .
git commit -m "feat: complete homepage with all React components"
git push origin main
```

---

## Environment Variables (when you set up Supabase)

Create a file called `.env` in the `frontend/` folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Then access them in code as:
```js
import.meta.env.VITE_SUPABASE_URL
```

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `npm run dev` fails | Run `npm install` first |
| Blank white screen | Check browser console for errors |
| Fonts not loading | Check internet connection (Google Fonts CDN) |
| Dark mode not working | Check `ThemeContext.jsx` is imported in `App.jsx` |
| CSS variables not applying | Make sure `global.css` is imported in `main.jsx` |

---

*DigiInvite — Made with ♥ in India*
