# Marvikala — Setup Guide

## What you need first (one-time installs)

1. **Node.js** — download from https://nodejs.org (choose "LTS" version)
2. **Free MongoDB Atlas account** — follow Step 2 below

---

## Step 1 — Get a free MongoDB database (Atlas)

1. Go to https://cloud.mongodb.com and create a free account
2. Click "Build a Database" → choose **M0 Free** → any region → Create
3. Create a username and password (save these!)
4. Under "Network Access" → Add IP Address → click **"Allow Access from Anywhere"**
5. Go to "Database" → click **"Connect"** → "Drivers" → copy the connection string
   It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
   Replace `<password>` with your actual password and add `marvikala` at the end:
   `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/marvikala`

---

## Step 2 — Set up the server

Open a terminal in the `marvikala/server` folder and run:

```bash
npm install
```

Copy the example env file and fill in your values:

```bash
copy .env.example .env
```

Open `.env` and fill in:
- `MONGODB_URI` — your MongoDB connection string from Step 1
- `JWT_SECRET` — any random long string (e.g. `mysecretkey12345`)
- `ADMIN_USERNAME` — your admin login username (e.g. `admin`)
- `ADMIN_PASSWORD` — your admin login password (e.g. `marvikala123`)

Start the server:

```bash
npm run dev
```

You should see: `Connected to MongoDB` and `Server running on port 5000`

---

## Step 3 — Set up the client (React frontend)

Open a **second terminal** in the `marvikala/client` folder and run:

```bash
npm install
npm run dev
```

You should see: `Local: http://localhost:5173`

---

## Step 4 — Open the website

- **Customer website:** http://localhost:5173
- **Admin panel:**      http://localhost:5173/admin/login

Log in with the username and password you set in `.env`

---

## How to use the Admin Panel

1. Go to http://localhost:5173/admin/login
2. Log in with your admin credentials
3. Click **"+ Add Product"** to add a new product
4. Fill in name, description, category, upload an image, set stock/featured
5. Click **"Save"** — product appears on the website instantly
6. Click **"Edit"** on any product to update it
7. Click **"Delete"** to remove it

---

## How to change the logo later

Replace the `🤚` emoji in these two files with an `<img>` tag:
- `client/src/components/Navbar.jsx` (line 4)
- `client/src/components/Footer.jsx` (line 3)

Put your logo image in `client/public/logo.png` and use:
```jsx
<img src="/logo.png" alt="Marvikala" style={{ width: 40, height: 40, borderRadius: '50%' }} />
```

---

## File structure

```
marvikala/
  server/
    models/Product.js       ← product database schema
    routes/products.js      ← product API (add/edit/delete)
    routes/auth.js          ← admin login
    middleware/auth.js      ← JWT check
    uploads/                ← uploaded product images (auto-created)
    server.js               ← main server file
    .env                    ← your secret config (never share this)
  client/
    src/
      pages/Home.jsx        ← customer-facing website
      pages/AdminLogin.jsx  ← admin login page
      pages/AdminDashboard.jsx ← admin product manager
      components/Navbar.jsx
      components/Footer.jsx
      components/EnquireModal.jsx
    index.css               ← all styling
```
