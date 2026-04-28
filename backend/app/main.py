# Load .env before anything else
from dotenv import load_dotenv
load_dotenv()

import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.database import engine, Base
from app.services.rate_limit import limiter
from app.services.csrf import validate_csrf_token

# Import all models
from app.models.user import User  # noqa
from app.models.cv import CV  # noqa
from app.models.scholarship import Scholarship  # noqa
from app.models.email_token import EmailToken  # noqa
from app.models.interview import InterviewQuestion  # noqa
from app.models.advice import Advice  # noqa
from app.models.progress import UserQuizResult, UserFlashcardProgress  # noqa
from app.models.audit_log import AuditLog  # noqa
from app.models.scholarship_checklist import UserScholarshipChecklist  # noqa
from app.models.scholarship_bookmark import ScholarshipBookmark  # noqa
from app.models.refresh_token import RefreshToken  # noqa

from app.routers import auth, cv, interview, scholarship, admin, advice
from app.seed import seed_data

Base.metadata.create_all(bind=engine)


def run_migrations():
    """Idempotent SQL migrations."""
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE AND created_at < NOW() - INTERVAL '1 minute'"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE"))

        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium'"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS tags VARCHAR(255)"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_a TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_b TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_c TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_d TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS correct_option VARCHAR(1)"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS explanation TEXT"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_quiz_results (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                total INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                percentage FLOAT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uqr_user ON user_quiz_results(user_id)"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_flashcard_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                question_id INTEGER NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
                viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ufp_user ON user_flashcard_progress(user_id)"))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_ufp_user_q ON user_flashcard_progress(user_id, question_id)"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45),
                details TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_al_user ON audit_logs(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at DESC)"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_scholarship_checklists (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
                items TEXT NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT uq_user_scholarship UNIQUE(user_id, scholarship_id)
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_usc_user ON user_scholarship_checklists(user_id)"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS scholarship_bookmarks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT uq_bookmark UNIQUE(user_id, scholarship_id)
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sb_user ON scholarship_bookmarks(user_id)"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(64) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                revoked_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_rt_hash ON refresh_tokens(token_hash)"))

        conn.commit()
    print("✓ Migrations applied")


def _run_deadline_reminders():
    """Send email reminders for scholarships with deadline exactly 7 days away."""
    from datetime import date, timedelta
    from app.database import SessionLocal
    from app.models.scholarship import Scholarship
    from app.models.scholarship_bookmark import ScholarshipBookmark
    from app.models.user import User
    from app.services.email_service import send_deadline_reminder_email

    target_date = date.today() + timedelta(days=7)
    db = SessionLocal()
    try:
        due = db.query(Scholarship).filter(Scholarship.deadline == target_date).all()
        for s in due:
            bookmarks = db.query(ScholarshipBookmark).filter(ScholarshipBookmark.scholarship_id == s.id).all()
            for bm in bookmarks:
                user = db.query(User).filter(User.id == bm.user_id, User.is_active == True, User.is_verified == True).first()
                if user:
                    send_deadline_reminder_email(user.email, user.first_name, s.name, str(s.deadline), s.website_url)
        if due:
            print(f"✓ Deadline reminders sent for {len(due)} scholarship(s)")
    except Exception as e:
        print(f"Deadline reminder алдаа [{type(e).__name__}]")
    finally:
        db.close()


async def _deadline_reminder_loop():
    while True:
        await asyncio.sleep(24 * 3600)
        _run_deadline_reminders()


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    seed_data()
    task = asyncio.create_task(_deadline_reminder_loop())
    yield
    task.cancel()


app = FastAPI(title="Career Platform API", version="1.0.0", lifespan=lifespan)

# ============ CSRF Middleware ============
_CSRF_SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}
_CSRF_EXEMPT_PATHS = {
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/refresh",
    "/api/auth/csrf-token",
    "/api/auth/logout",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method not in _CSRF_SAFE_METHODS and request.url.path not in _CSRF_EXEMPT_PATHS:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                csrf_token = request.headers.get("X-CSRF-Token", "")
                if not csrf_token or not validate_csrf_token(csrf_token):
                    return JSONResponse(
                        status_code=403,
                        content={"detail": "CSRF token буруу эсвэл байхгүй байна"},
                    )
        return await call_next(request)


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CSRFMiddleware)

# ============ Rate limiting ============
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ============ CORS ============
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RateLimitExceeded):
        raise exc
    print(f"АЛДАА [{type(exc).__name__}] {request.method} {request.url.path}")
    return JSONResponse(status_code=500, content={"detail": "Серверийн дотоод алдаа гарлаа"})


app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(interview.router)
app.include_router(scholarship.router)
app.include_router(admin.router)
app.include_router(advice.router)

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/")
def root():
    return {"message": "Career Platform API ажиллаж байна!"}
