from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Response
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import secrets

from app.database import get_db
from app.models.user import User
from app.models.email_token import EmailToken, TokenType
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token, PasswordChange,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
    ResendVerificationRequest, ProfileUpdate,
)
from app.services.auth import hash_password, verify_password, create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM, get_current_user
from app.services.email_service import send_verification_email, send_password_reset_email
from app.services.rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _create_token(db: Session, user: User, token_type: TokenType, hours: int) -> str:
    """Generate a secure random token, store it in DB, return the token string."""
    token_str = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=hours)
    db_token = EmailToken(
        user_id=user.id,
        token=token_str,
        token_type=token_type,
        expires_at=expires_at,
    )
    db.add(db_token)
    db.commit()
    return token_str


@router.put("/profile", response_model=UserResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.first_name:
        current_user.first_name = data.first_name
    if data.last_name:
        current_user.last_name = data.last_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, response: Response, user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="И-мэйл хаяг бүртгэлтэй байна")

    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой")

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password=hash_password(user_data.password),
        is_verified=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = _create_token(db, new_user, TokenType.verify_email, hours=24)
    background_tasks.add_task(send_verification_email, new_user.email, new_user.first_name, token)

    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, response: Response, user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="И-мэйл эсвэл нууц үг буруу байна")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Таны бүртгэл түр хаагдсан байна. Админтай холбогдоно уу.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="И-мэйл хаягаа баталгаажуулна уу. Баталгаажуулах линк и-мэйл хаягруу илгээсэн болно."
        )

    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(user.id)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=Token)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token буруу байна")
        sub = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Token буруу байна")
        user_id = int(sub)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token хүчингүй эсвэл хугацаа дууссан")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Хэрэглэгч олдсонгүй")

    new_access = create_access_token(data={"sub": user.id})
    new_refresh = create_refresh_token(user.id)
    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.cv import CV
    from app.models.progress import UserQuizResult, UserFlashcardProgress

    cv_count = db.query(CV).filter(CV.user_id == current_user.id).count()
    studied_questions = db.query(UserFlashcardProgress).filter(UserFlashcardProgress.user_id == current_user.id).count()
    quiz_count = db.query(UserQuizResult).filter(UserQuizResult.user_id == current_user.id).count()

    profile_done = 1 if current_user.phone else 0
    cv_done = 1 if cv_count > 0 else 0
    quiz_done = 1 if quiz_count > 0 else 0
    flashcard_done = 1 if studied_questions >= 10 else 0

    total = 5
    done = profile_done + min(cv_count, 2) + quiz_done + flashcard_done
    progress = int((done / total) * 100)

    return {
        "cv_count": cv_count,
        "progress": min(progress, 100),
        "studied_questions": studied_questions,
        "quiz_count": quiz_count,
        "profile_done": profile_done == 1,
        "cv_done": cv_done == 1,
        "quiz_done": quiz_done == 1,
    }


@router.post("/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Хуучин нууц үг буруу байна")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой")

    if data.old_password == data.new_password:
        raise HTTPException(status_code=400, detail="Шинэ нууц үг хуучнаасаа ялгаатай байх ёстой")

    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Нууц үг амжилттай солигдлоо"}


@router.delete("/me")
def delete_my_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return {"message": "Бүртгэл устгагдлаа"}


# ------- Email verification -------

@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    token_row = db.query(EmailToken).filter(
        EmailToken.token == data.token,
        EmailToken.token_type == TokenType.verify_email,
    ).first()

    if not token_row:
        raise HTTPException(status_code=400, detail="Баталгаажуулах линк буруу эсвэл хүчингүй")

    if token_row.used_at:
        raise HTTPException(status_code=400, detail="Энэ линк өмнө нь ашиглагдсан")

    now = datetime.now(timezone.utc)
    expires_at = token_row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise HTTPException(status_code=400, detail="Баталгаажуулах линкийн хугацаа дууссан. Шинэ линк авах уу?")

    user = db.query(User).filter(User.id == token_row.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")

    user.is_verified = True
    user.verified_at = now
    token_row.used_at = now
    db.commit()

    return {"message": "И-мэйл хаяг амжилттай баталгаажлаа! Одоо нэвтэрч болно."}


@router.post("/resend-verification")
@limiter.limit("3/minute")
def resend_verification(request: Request, response: Response, data: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and not user.is_verified:
        token = _create_token(db, user, TokenType.verify_email, hours=24)
        background_tasks.add_task(send_verification_email, user.email, user.first_name, token)
    return {"message": "Хэрэв тухайн и-мэйл бүртгэлтэй бол баталгаажуулах линк илгээгдсэн."}


# ------- Password reset -------

@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, response: Response, data: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and user.is_active:
        token = _create_token(db, user, TokenType.reset_password, hours=1)
        background_tasks.add_task(send_password_reset_email, user.email, user.first_name, token)
    return {"message": "Хэрэв тухайн и-мэйл бүртгэлтэй бол нууц үг сэргээх линк илгээгдсэн."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, response: Response, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой")

    token_row = db.query(EmailToken).filter(
        EmailToken.token == data.token,
        EmailToken.token_type == TokenType.reset_password,
    ).first()

    if not token_row:
        raise HTTPException(status_code=400, detail="Линк буруу эсвэл хүчингүй")

    if token_row.used_at:
        raise HTTPException(status_code=400, detail="Энэ линк өмнө нь ашиглагдсан")

    now = datetime.now(timezone.utc)
    expires_at = token_row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise HTTPException(status_code=400, detail="Линкийн хугацаа дууссан. Шинэ линк авна уу.")

    user = db.query(User).filter(User.id == token_row.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")

    user.password = hash_password(data.new_password)
    token_row.used_at = now

    db.query(EmailToken).filter(
        EmailToken.user_id == user.id,
        EmailToken.token_type == TokenType.reset_password,
        EmailToken.used_at.is_(None),
        EmailToken.id != token_row.id,
    ).update({"used_at": now})

    db.commit()

    return {"message": "Нууц үг амжилттай шинэчлэгдлээ! Одоо нэвтэрч болно."}