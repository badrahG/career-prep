# Load .env before anything else
from dotenv import load_dotenv
load_dotenv()

import os
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
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
from app.models.interview_case import InterviewCase  # noqa
from app.models.advice import Advice  # noqa
from app.models.progress import UserQuizResult, UserFlashcardProgress, UserStarSession  # noqa
from app.models.audit_log import AuditLog  # noqa
from app.models.scholarship_checklist import UserScholarshipChecklist  # noqa
from app.models.scholarship_bookmark import ScholarshipBookmark  # noqa
from app.models.refresh_token import RefreshToken  # noqa
from app.models.major import Major  # noqa
from app.models.notification import Notification, NotificationRead  # noqa
from app.models.subscription import SubscriptionPlan, UserSubscription, UsageTracking, ExtraPackPurchase  # noqa
from app.models.system_feedback import SystemFeedback  # noqa
from app.models.certificate import Certificate  # noqa

from app.routers import auth, cv, interview, scholarship, admin, advice, scholarship_cv
from app.routers import certificates
from app.routers import cv_analysis
from app.routers import search
from app.routers import notification
from app.routers import settings
from app.routers import feedback
from app.routers import subscription
from app.seed import seed_data
from app.services.auth import get_current_user

Base.metadata.create_all(bind=engine)


def run_migrations():
    """Idempotent SQL migrations."""
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS student_code VARCHAR(50)"))

        # Convert native questioncategory enum to VARCHAR to support new 'case' value
        conn.execute(text("""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questioncategory') THEN
                    ALTER TABLE interview_questions ALTER COLUMN category TYPE VARCHAR(50) USING category::text;
                    DROP TYPE IF EXISTS questioncategory CASCADE;
                END IF;
            END $$
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS interview_cases (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                case_text TEXT NOT NULL,
                difficulty VARCHAR(20) DEFAULT 'medium',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS case_id INTEGER REFERENCES interview_cases(id) ON DELETE SET NULL"))
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
            CREATE TABLE IF NOT EXISTS certificates (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                issued_date DATE,
                cloudinary_url VARCHAR(500),
                cloudinary_public_id VARCHAR(255),
                external_id INTEGER,
                source VARCHAR(100) DEFAULT 'volunteerchain',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_cert_user ON certificates(user_id)"))

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

        # ── Majors ─────────────────────────────────────────────────────────────
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS majors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS major_id INTEGER REFERENCES majors(id) ON DELETE SET NULL"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS is_open_ended BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS open_ended_sample TEXT"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_iq_major ON interview_questions(major_id)"))

        # ── Notifications ───────────────────────────────────────────────────────
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                body TEXT,
                url VARCHAR(300),
                ref_key VARCHAR(120) UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC)"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS notification_reads (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
                read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT uq_notif_read UNIQUE(user_id, notification_id)
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_nr_user ON notification_reads(user_id)"))

        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_prefs TEXT"))

        conn.execute(text("ALTER TABLE educations ADD COLUMN IF NOT EXISTS level VARCHAR(100)"))
        conn.execute(text("ALTER TABLE cvs ADD COLUMN IF NOT EXISTS cv_type VARCHAR(20) NOT NULL DEFAULT 'job'"))
        conn.execute(text("ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS directions TEXT"))
        conn.execute(text("ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS opportunities TEXT"))
        conn.execute(text("ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS notes TEXT"))

        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS cv_template_feedbacks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                template_type VARCHAR(20) NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                pros TEXT,
                cons TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                CONSTRAINT uq_user_template UNIQUE(user_id, template_type)
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_ctf_template ON cv_template_feedbacks(template_type)"))

        # ── Subscription & Usage ─────────────────────────────────────────────────
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) UNIQUE NOT NULL,
                price INTEGER NOT NULL DEFAULT 0,
                ai_limit INTEGER NOT NULL,
                tr_limit INTEGER NOT NULL,
                cover_letter BOOLEAN NOT NULL DEFAULT FALSE,
                watermark BOOLEAN NOT NULL DEFAULT TRUE
            )
        """))
        conn.execute(text("""
            INSERT INTO subscription_plans (name, price, ai_limit, tr_limit, cover_letter, watermark)
            VALUES ('free', 0, 15, 5, FALSE, TRUE), ('pro', 5900, 80, 40, TRUE, FALSE)
            ON CONFLICT (name) DO NOTHING
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
                period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                payment_ref VARCHAR(200),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_usub_user ON user_subscriptions(user_id)"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS usage_tracking (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                ai_used INTEGER NOT NULL DEFAULT 0,
                tr_used INTEGER NOT NULL DEFAULT 0,
                tr_char_used INTEGER NOT NULL DEFAULT 0,
                period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                period_end TIMESTAMP WITH TIME ZONE NOT NULL
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_tracking(user_id)"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS extra_pack_purchases (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ai_remaining INTEGER NOT NULL DEFAULT 20,
                tr_remaining INTEGER NOT NULL DEFAULT 10,
                tr_char_remaining INTEGER NOT NULL DEFAULT 80000,
                purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                payment_ref VARCHAR(200)
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_epp_user ON extra_pack_purchases(user_id)"))

        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_ai_limit INTEGER"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_tr_limit INTEGER"))

        # ── PDF export tracking ──────────────────────────────────────────────────
        conn.execute(text("ALTER TABLE cvs ADD COLUMN IF NOT EXISTS pdf_export_count INTEGER NOT NULL DEFAULT 0"))

        # ── System feedback ──────────────────────────────────────────────────────
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS system_feedbacks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                category VARCHAR(30) NOT NULL DEFAULT 'general',
                message TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sf_user ON system_feedbacks(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sf_created ON system_feedbacks(created_at DESC)"))

        # ── Analytics ────────────────────────────────────────────────────────────
        conn.execute(text("ALTER TABLE advices ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0"))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_star_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                major_id INTEGER REFERENCES majors(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uss_user ON user_star_sessions(user_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uss_major ON user_star_sessions(major_id)"))

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
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
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
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
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
app.include_router(cv_analysis.router)
app.include_router(scholarship_cv.router)
app.include_router(search.router)
app.include_router(notification.router)
app.include_router(settings.router)
app.include_router(feedback.router)
app.include_router(subscription.router)
app.include_router(certificates.router)

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/uploads/{file_path:path}")
async def serve_upload(file_path: str):
    resolved = (UPLOAD_DIR / file_path).resolve()
    if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Хандах эрхгүй")
    if not resolved.exists() or not resolved.is_file():
        raise HTTPException(status_code=404, detail="Файл олдсонгүй")
    return FileResponse(resolved)


@app.get("/api/health")
@limiter.exempt
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "Career Platform API ажиллаж байна!"}
