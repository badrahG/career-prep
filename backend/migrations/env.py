import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from alembic import context

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models so Alembic knows about them for autogenerate
from app.database import Base  # noqa
from app.models.user import User  # noqa
from app.models.cv import CV, CVTemplate  # noqa
from app.models.scholarship import Scholarship  # noqa
from app.models.email_token import EmailToken  # noqa
from app.models.interview import InterviewQuestion  # noqa
from app.models.advice import Advice  # noqa
from app.models.progress import UserQuizResult, UserFlashcardProgress  # noqa
from app.models.audit_log import AuditLog  # noqa
from app.models.scholarship_checklist import UserScholarshipChecklist  # noqa
from app.models.scholarship_bookmark import ScholarshipBookmark  # noqa
from app.models.refresh_token import RefreshToken  # noqa

target_metadata = Base.metadata

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://odoo:odoo123@localhost:5432/career_platform",
)
config.set_main_option("sqlalchemy.url", DATABASE_URL)


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
