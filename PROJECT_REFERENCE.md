# Marvikala — Complete Project Reference

Paste this entire file into a new Claude chat to resume work instantly.

---

## What is this project?
A full-stack e-commerce website for **Marvikala** — a handmade crochet business based in Mumbai.
- Instagram: @marvikala
- WhatsApp: +91 97692 38160
- Owner: Reyansh Agarwal (amazedreyansh09@gmail.com)

---

## Live URLs
| Service | URL |
|---------|-----|
| **Website (frontend)** | https://marvikala.vercel.app |
| **Backend API** | https://marvikala-api.onrender.com |
| **Admin Panel** | https://marvikala.vercel.app/admin/login |

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Plain CSS (index.css) |
| Routing | React Router v6 |
| HTTP client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (M0 free) |
| Image storage | Cloudinary |
| Frontend hosting | Vercel (auto-deploys from GitHub) |
| Backend hosting | Render (free tier, spins down after 15min inactivity) |
| Font | Poppins (Google Fonts) |

---

## GitHub Repository
- URL: https://github.com/ProReyansh/marvikala
- Branch: `main`
- Push to main → Vercel and Render auto-redeploy

---

## Project Folder Structure
```
marvikala/
├── client/                        # React frontend (Vite)
│   ├── public/
│   │   ├── logo.jpg               # Brand logo (hand + M, yellow bg)
│   │   └── logo.svg               # Old SVG (unused)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky navbar with search + hamburger menu
│   │   │   ├── Footer.jsx         # Footer with logo + links
│   │   │   ├── EnquireModal.jsx   # Popup when clicking "Enquire Now"
│   │   │   └── CustomOrderModal.jsx # Popup for custom orders
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Main public page
│   │   │   ├── AdminLogin.jsx     # Admin login page
│   │   │   └── AdminDashboard.jsx # Admin product management
│   │   ├── App.jsx                # Routes setup
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # ALL styles (single file)
│   ├── index.html                 # SEO meta tags + favicon
│   ├── vite.config.js             # Vite config (proxy for local dev)
│   └── vercel.json                # Vercel SPA routing + API proxy
├── server/
│   ├── models/
│   │   └── Product.js             # MongoDB product schema
│   ├── routes/
│   │   ├── products.js            # CRUD API + Cloudinary image upload
│   │   └── auth.js                # Admin login → returns JWT
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── server.js                  # Express app entry point
│   ├── package.json               # Backend dependencies
│   └── .env                       # Local env vars (NOT in git)
├── package.json                   # Root package.json (build script for Netlify, unused now)
└── PROJECT_REFERENCE.md           # This file
```

---

## How to Make Code Changes
1. Edit files in `C:\Users\prade\OneDrive\Desktop\Reyansh\Coding\Claude\marvikala`
2. Open PowerShell in that folder
3. Run:
```powershell
git add .
git commit -m "describe what you changed"
git push
```
4. Vercel redeploys frontend (~1-2 min)
5. Render redeploys backend (~2-3 min)

---

## Environment Variables

### Render (backend) — set in Render dashboard → Environment
| Key | Purpose |
|-----|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for admin JWT tokens |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | `dl5vpvnqe` |
| `CLOUDINARY_API_KEY` | `137324564522162` |
| `CLOUDINARY_API_SECRET` | (set in Render, keep secret) |
| `FRONTEND_URL` | `https://marvikala.vercel.app` |

### Vercel (frontend) — no env vars needed
All API calls are proxied via `client/vercel.json`

---

## API Endpoints
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/products` | None | Get all products |
| POST | `/api/products` | JWT | Add product |
| PUT | `/api/products/:id` | JWT | Edit product |
| DELETE | `/api/products/:id` | JWT | Delete product |
| POST | `/api/auth/login` | None | Admin login |
| GET | `/api/health` | None | Server health check |

---

## Product Categories
`flowers`, `keychains`, `bookmarks`, `laddugopaldress`, `homedecor`, `hairaccessories`, `jewellery`, `rakhi`, `custom`

---

## Product Schema (MongoDB)
```js
{
  name: String (required),
  description: String,
  category: String (enum above),
  image: String (Cloudinary URL),
  inStock: Boolean (default: true),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Key Design Decisions
- **Single CSS file** (`index.css`) — all styles in one place, no CSS modules
- **Cloudinary for images** — Render free tier has ephemeral filesystem, images would disappear on redeploy
- **JWT auth** — admin token stored in `localStorage` as `marvikala_admin_token`
- **Vercel proxy** — `vercel.json` rewrites `/api/*` to Render backend so no CORS issues
- **No price field** — products use "Enquire Now" → WhatsApp/Instagram (by design)
- **Featured products** sort first in the grid

---

## Known Issues / Things to Watch
- **Render spins down** after 15 min inactivity → first load after a gap is slow (30-60s)
  - Fix: set up UptimeRobot to ping `/api/health` every 5 minutes
- **Netlify limit reached** — migrated to Vercel (Netlify account: amazedreyansh09)
- After any Render redeploy, products still show (stored in MongoDB + Cloudinary, not local)

---

## Services & Accounts
| Service | Account | Purpose |
|---------|---------|---------|
| Vercel | amazedreyansh09@gmail.com | Frontend hosting |
| Render | (same email) | Backend hosting |
| MongoDB Atlas | (same email) | Database |
| Cloudinary | amazedreyansh09 | Image storage |
| GitHub | ProReyansh | Code repository |
| Netlify | amazedreyansh09 (paused - limit reached) | Old frontend host |

---

## How to Resume in a New Claude Chat
Paste this file and say:
> "This is my Marvikala project. I want to [describe what you want to change]."

Claude will have full context to make changes immediately.
