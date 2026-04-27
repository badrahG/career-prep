"""initial schema — baseline migration

Revision ID: 001
Revises:
Create Date: 2026-04-26
"""
from typing import Sequence, Union
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Users extra columns ─────────────────────────────────────────────────
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE")
    op.execute("UPDATE users SET is_verified = TRUE WHERE is_verified = FALSE AND created_at < NOW() - INTERVAL '1 minute'")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE")

    # ── Interview questions extra columns ───────────────────────────────────
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium'")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS tags VARCHAR(255)")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS is_quiz BOOLEAN NOT NULL DEFAULT FALSE")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_a TEXT")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_b TEXT")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_c TEXT")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS option_d TEXT")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS correct_option VARCHAR(1)")
    op.execute("ALTER TABLE interview_questions ADD COLUMN IF NOT EXISTS explanation TEXT")

    # ── Quiz results ────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_quiz_results (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            total INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            percentage FLOAT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_uqr_user ON user_quiz_results(user_id)")

    # ── Flashcard progress ──────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_flashcard_progress (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            question_id INTEGER NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
            viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_ufp_user ON user_flashcard_progress(user_id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_ufp_user_q ON user_flashcard_progress(user_id, question_id)")

    # ── Audit logs ──────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(100) NOT NULL,
            ip_address VARCHAR(45),
            details TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_al_user ON audit_logs(user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at DESC)")

    # ── Scholarship checklists ──────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS user_scholarship_checklists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
            items TEXT NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT uq_user_scholarship UNIQUE(user_id, scholarship_id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_usc_user ON user_scholarship_checklists(user_id)")

    # ── Scholarship bookmarks ───────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS scholarship_bookmarks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT uq_bookmark UNIQUE(user_id, scholarship_id)
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_sb_user ON scholarship_bookmarks(user_id)")

    # ── CV template type: enum → varchar ────────────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='cvs' AND column_name='template_type'
                AND udt_name='templatetype'
            ) THEN
                ALTER TABLE cvs ALTER COLUMN template_type TYPE VARCHAR(50) USING template_type::text;
                DROP TYPE IF EXISTS templatetype;
            END IF;
        END $$
    """)

    # ── CV templates table ──────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS cv_templates (
            id SERIAL PRIMARY KEY,
            key VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            preview_url VARCHAR(500),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("""
        INSERT INTO cv_templates (key, name, description, sort_order, is_active) VALUES
            ('modern',  'Орчин үеийн', 'Цэвэр, орчин үеийн дизайн', 1, TRUE),
            ('classic', 'Сонгодог',    'Уламжлалт, албан ёсны загвар', 2, TRUE),
            ('minimal', 'Хялбар',      'Цомхон, хялбар загвар', 3, TRUE)
        ON CONFLICT (key) DO NOTHING
    """)

    # ── Refresh tokens ──────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(64) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            revoked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_rt_hash ON refresh_tokens(token_hash)")


def downgrade() -> None:
    # Baseline migration — downgrade not supported
    pass
