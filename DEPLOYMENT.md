# PM Cockpit Pro — Deployment Guide

Production flow: **Vercel frontend → Render backend → Supabase PostgreSQL**. Gemini runs in the browser (frontend build env).

Live frontend: https://pmo-cockpit-pro.vercel.app/

## Environment variables

### Backend (Render)

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Supabase URI (Settings → Database → Connection string → URI) |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto on Render | (set by Render) |
| `FRONTEND_URL` | Yes | `https://pmo-cockpit-pro.vercel.app` |

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_BASE` | Yes | `https://pmo-cockpit-api.onrender.com` (your actual Render URL, no trailing slash) |
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |

**Important:** After changing `VITE_API_BASE` or `GEMINI_API_KEY` on Vercel, trigger a **new deployment** (env vars are baked in at build time).

### Local development

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.local.example` → `frontend/.env.local`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → run `backend/migrations/supabase_schema.sql`.
3. Run `backend/migrations/001_add_ai_features.sql`.
4. Optionally run `backend/migrations/supabase_seed.sql` for demo data.
5. Copy **Settings → Database → Connection string → URI** into Render `DATABASE_URL`.
   - Use the **Session pooler** URI if direct connection fails from Render.
   - Ensure the password is URL-encoded if it contains special characters.

## Render (backend)

1. [dashboard.render.com](https://dashboard.render.com) → **New Web Service** → connect GitHub repo.
2. **Root directory:** `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Health check path:** `/health/ready`
6. Environment variables (see table above).
7. Copy the service URL (e.g. `https://pmo-cockpit-api.onrender.com`) — use it as `VITE_API_BASE` on Vercel.

`render.yaml` in the repo documents the same settings.

## Vercel (frontend)

1. Import GitHub repo at [vercel.com](https://vercel.com).
2. **Root directory:** `frontend` (or use repo `vercel.json`).
3. Framework: Vite.
4. Set `VITE_API_BASE` to your Render URL and `GEMINI_API_KEY`.
5. Deploy.
6. On Render, set `FRONTEND_URL=https://pmo-cockpit-pro.vercel.app` and redeploy backend if needed.

## Verification checklist

- [ ] `GET https://<render-url>/` → `{ "status": "ok", ... }`
- [ ] `GET https://<render-url>/health/ready` → `{ "status": "ok", "database": "connected" }`
- [ ] Browser DevTools → Network: API calls go to Render URL (not `localhost:5001`)
- [ ] Define → projects list loads from Supabase
- [ ] Add/delete project works
- [ ] Execute → Notes persist after refresh
- [ ] Define → Run AI Health / Control → Reports (Gemini key set on Vercel)

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Empty Define project list | `VITE_API_BASE` missing on Vercel | Set env var, redeploy frontend |
| `localhost:5001` in Network tab | Same as above | Redeploy after setting `VITE_API_BASE` |
| CORS error in console | Wrong/missing `FRONTEND_URL` | Set to exact Vercel URL on Render; `*.vercel.app` is also allowed |
| `/health/ready` database error | Bad `DATABASE_URL` or schema not migrated | Fix Supabase URI; run migrations |
| Gemini features fail | `GEMINI_API_KEY` missing on Vercel | Set on Vercel, redeploy |
| Render 404 on API URL | Service not deployed or wrong URL | Confirm service name/URL in Render dashboard |
