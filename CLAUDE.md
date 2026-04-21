# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Mongolian-language career development platform (CareerPrep) for CV building, interview preparation, scholarship discovery, and career advice. Full-stack monorepo: FastAPI backend + React 19 frontend + PostgreSQL.

## Development Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173
npm run build
npm run lint       # ESLint
```

No test suite exists currently.

## Architecture

### Key Ports & Connections
- Backend API: `http://localhost:8001/api`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`, database `career_platform`, user `odoo`, password `odoo123` (hardcoded in `backend/app/database.py`)

### Backend (`backend/app/`)
- `main.py` — FastAPI app, CORS config, router registration, startup hooks (`run_migrations()`, `seed_data()`)
- `database.py` — SQLAlchemy engine/session setup
- `models/` — SQLAlchemy ORM models
- `schemas/` — Pydantic v2 request/response schemas
- `routers/` — Route handlers: `auth`, `cv`, `interview`, `scholarship`, `advice`, `admin`
- `services/auth.py` — JWT (HS256, 30-min expiry), bcrypt, `get_current_user` dependency
- `services/email_service.py` — Gmail SMTP; falls back to console logging if SMTP creds missing
- `services/rate_limit.py` — slowapi rate limiter (IP-keyed; 200/min default, tighter limits on auth routes)

All routes are prefixed `/api`. Auth uses Bearer tokens in Authorization header.

### Frontend (`frontend/src/`)
- `App.jsx` — BrowserRouter, route definitions, `PrivateRoute`/`AdminRoute` guards
- `context/AuthContext.jsx` — Global auth state; token + user stored in `localStorage`; fetches `/auth/me` on load
- `services/api.js` — Axios instance with base URL `http://localhost:8001/api` and token interceptor
- `pages/` — One file per route (~27 pages)
- `components/` — Shared UI: `EmptyState`, `Skeleton`, `OrgLogo`

### Database Models
| Model | Table | Notes |
|-------|-------|-------|
| User | `users` | role enum: `user`/`admin`; email verification required |
| CV | `cvs` | template enum: `modern`/`classic`/`minimal` |
| Education, WorkExperience, Skill | `educations`, `work_experiences`, `skills` | FK to CV |
| InterviewQuestion | `interview_questions` | category enum: `general`/`technical`/`behavioral`; quiz mode has ABCD options |
| Scholarship | `scholarships` | |
| Advice | `advices` | category enum: `cv`/`interview`/`job_search`/`career` |
| EmailToken | `email_tokens` | token_type enum: `verify_email`/`reset_password`; 1-hour expiry |

### Migrations & Seeding
Migrations run automatically on startup via `run_migrations()` in `main.py` — idempotent `ALTER TABLE IF NOT EXISTS` statements, not Alembic migrations. Seed data also runs on startup via `seed_data()`.

### Email
Configured via `backend/.env`:
```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME, FRONTEND_URL
```
If SMTP credentials are absent, email functions print to console instead of sending.

### CV Export
PDF export uses `html2canvas` + `jsPDF` (root `package.json` dependencies), rendered client-side.

## Deployment

### Quick start with Docker (backend + PostgreSQL)

```bash
# 1. Copy and fill in the env file
cp backend/.env.example backend/.env
# Edit backend/.env: set SECRET_KEY, SMTP_USER/PASSWORD, ALLOWED_ORIGINS

# 2. Start backend + database
docker compose up -d --build

# 3. Build frontend for production
cd frontend
npm install
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or any static host
```

### Environment variables (backend/.env)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | **Yes** | JWT signing key — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | Yes | PostgreSQL DSN — Docker Compose sets this automatically |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins, e.g. `https://careerprep.mn` |
| `API_BASE_URL` | Yes | Public URL of this backend, e.g. `https://api.careerprep.mn` |
| `SMTP_USER` | No | Gmail address; leave empty to log emails to console |
| `SMTP_PASSWORD` | No | Gmail App Password (not your account password) |
| `FRONTEND_URL` | No | Used in email links, defaults to `http://localhost:5173` |

### Production checklist

- [ ] Generate a new `SECRET_KEY` (never use the default)
- [ ] Set `ALLOWED_ORIGINS` to your real frontend domain
- [ ] Set `API_BASE_URL` to your real backend domain
- [ ] Configure SMTP credentials for email verification / password reset
- [ ] Run behind a reverse proxy (nginx/Caddy) with TLS
- [ ] Persist `backend/uploads/` volume for user-uploaded files
