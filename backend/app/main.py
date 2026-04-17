# Load .env before anything else
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import engine, Base

# Import all models so Base.metadata knows about them
from app.models.user import User  # noqa
from app.models.cv import CV  # noqa
from app.models.scholarship import Scholarship  # noqa
from app.models.email_token import EmailToken  # noqa
from app.models.interview import InterviewQuestion  # noqa

from app.routers import auth, cv, interview, scholarship, admin
from app.seed import seed_data

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Career Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"АЛДАА: {exc}")
    return JSONResponse(status_code=500, content={"detail": str(exc)})


app.include_router(auth.router)
app.include_router(cv.router)
app.include_router(interview.router)
app.include_router(scholarship.router)
app.include_router(admin.router)


def run_migrations():
    """Idempotent SQL migrations for new columns."""
    with engine.connect() as conn:
        # Users: admin & verification fields
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE"))
        conn.execute(text("UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE AND created_at < NOW() - INTERVAL '1 minute'"))

        # Interview questions: metadata
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium'"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS tags VARCHAR(255)"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE"))

        # Interview questions: quiz fields
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN NOT NULL DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_a TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_b TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_c TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_d TEXT"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS correct_option VARCHAR(1)"))
        conn.execute(text("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS explanation TEXT"))

        conn.commit()
    print("✓ Migrations applied")


@app.on_event("startup")
def startup():
    run_migrations()
    seed_data()


@app.get("/")
def root():
    return {"message": "Career Platform API ажиллаж байна!"}