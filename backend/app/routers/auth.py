from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import JWTError, jwt
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import secrets
import hashlib

from app.database import get_db
from app.models.user import User
from app.models.email_token import EmailToken, TokenType
from app.models.refresh_token import RefreshToken
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token, PasswordChange,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
    ResendVerificationRequest, ProfileUpdate,
)
from app.services.auth import hash_password, verify_password, create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, get_current_user
from app.services.email_service import send_verification_email, send_password_reset_email, send_welcome_email
from app.services.rate_limit import limiter
from app.services.csrf import generate_csrf_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой")
    if not any(c.isupper() for c in password):
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн нэг том үсэг агуулах ёстой")
    if not any(c.islower() for c in password):
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн нэг жижиг үсэг агуулах ёстой")
    if not any(c.isdigit() for c in password):
        raise HTTPException(status_code=400, detail="Нууц үг хамгийн нэг тоо агуулах ёстой")


def write_audit_log(db: Session, user_id: Optional[int], action: str, request: Request, details: str = None):
    from app.models.audit_log import AuditLog
    try:
        ip = request.client.host if request.client else "unknown"
        log = AuditLog(user_id=user_id, action=action, ip_address=ip, details=details)
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit log алдаа [{type(e).__name__}]")


@router.get("/csrf-token")
def get_csrf_token():
    return {"csrf_token": generate_csrf_token()}


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
def update_profile(request: Request, data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.first_name:
        current_user.first_name = data.first_name
    if data.last_name:
        current_user.last_name = data.last_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    write_audit_log(db, current_user.id, "profile_update", request)
    return current_user


@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, response: Response, user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="И-мэйл хаяг бүртгэлтэй байна")

    _validate_password_strength(user_data.password)

    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password=hash_password(user_data.password),
        is_verified=False,
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="И-мэйл хаяг бүртгэлтэй байна")
    db.refresh(new_user)

    token = _create_token(db, new_user, TokenType.verify_email, hours=24)
    background_tasks.add_task(send_verification_email, new_user.email, new_user.first_name, token)

    return new_user


_MAX_FAILED = 5
_LOCKOUT_MINUTES = 15


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, response: Response, user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if user and user.locked_until:
        now = datetime.now(timezone.utc)
        locked = user.locked_until if user.locked_until.tzinfo else user.locked_until.replace(tzinfo=timezone.utc)
        if locked > now:
            remaining = int((locked - now).total_seconds() / 60) + 1
            raise HTTPException(status_code=429, detail=f"Хэт олон удаа буруу оруулсан. {remaining} минутын дараа дахин оролдоно уу.")

    if not user or not verify_password(user_data.password, user.password):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= _MAX_FAILED:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=_LOCKOUT_MINUTES)
            db.commit()
        raise HTTPException(status_code=401, detail="И-мэйл эсвэл нууц үг буруу байна")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Таны бүртгэл түр хаагдсан байна. Админтай холбогдоно уу.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="И-мэйл хаягаа баталгаажуулна уу. Баталгаажуулах линк и-мэйл хаягруу илгээсэн болно."
        )

    user.failed_login_attempts = 0
    user.locked_until = None

    access_token = create_access_token(data={"sub": user.id})
    refresh_token_str = create_refresh_token(user.id)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hashlib.sha256(refresh_token_str.encode()).hexdigest(),
        expires_at=expires_at,
    ))
    db.commit()

    write_audit_log(db, user.id, "login", request, details=user.email)
    return {"access_token": access_token, "refresh_token": refresh_token_str, "token_type": "bearer"}


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

    token_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if not stored or stored.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Token хүчингүй эсвэл цуцлагдсан")
    now = datetime.now(timezone.utc)
    exp = stored.expires_at if stored.expires_at.tzinfo else stored.expires_at.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(status_code=401, detail="Token хугацаа дууссан")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Хэрэглэгч олдсонгүй")

    stored.revoked_at = now

    new_access = create_access_token(data={"sub": user.id})
    new_refresh = create_refresh_token(user.id)
    new_expires = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hashlib.sha256(new_refresh.encode()).hexdigest(),
        expires_at=new_expires,
    ))
    db.commit()
    return {"access_token": new_access, "refresh_token": new_refresh, "token_type": "bearer"}


@router.post("/logout")
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked_at.is_(None),
    ).first()
    if stored:
        stored.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return {"message": "Амжилттай гарлаа"}


@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import json as _json
    from sqlalchemy import select, func as sqlfunc
    from app.models.cv import CV
    from app.models.progress import UserQuizResult, UserFlashcardProgress
    from app.models.scholarship_checklist import UserScholarshipChecklist

    uid = current_user.id

    # Single round-trip: cv_count, studied, quiz_count, quiz_avg
    row = db.execute(
        select(
            sqlfunc.coalesce(
                select(sqlfunc.count(CV.id)).where(CV.user_id == uid).correlate(None).scalar_subquery(), 0
            ).label("cv_count"),
            sqlfunc.coalesce(
                select(sqlfunc.count(UserFlashcardProgress.id)).where(UserFlashcardProgress.user_id == uid).correlate(None).scalar_subquery(), 0
            ).label("studied"),
            sqlfunc.coalesce(
                select(sqlfunc.count(UserQuizResult.id)).where(UserQuizResult.user_id == uid).correlate(None).scalar_subquery(), 0
            ).label("quiz_count"),
            sqlfunc.coalesce(
                select(sqlfunc.avg(UserQuizResult.percentage)).where(UserQuizResult.user_id == uid).correlate(None).scalar_subquery(), 0
            ).label("quiz_avg"),
        )
    ).one()

    cv_count = row.cv_count
    studied_questions = row.studied
    quiz_count = row.quiz_count
    quiz_avg = round(float(row.quiz_avg))

    # Second query: checklist rows (JSON content шалгах шаардлагатай)
    checklist_rows = db.query(UserScholarshipChecklist).filter(UserScholarshipChecklist.user_id == uid).all()
    checklist_count = 0
    for r in checklist_rows:
        try:
            if any(item.get("done") for item in _json.loads(r.items)):
                checklist_count += 1
        except Exception:
            pass

    profile_done = bool(current_user.phone)
    cv_done = cv_count > 0
    flashcard_done = studied_questions >= 5
    checklist_done = checklist_count > 0
    cv_two_done = cv_count >= 2

    total = 5
    done = sum([profile_done, cv_done, flashcard_done, checklist_done, cv_two_done])
    progress = int((done / total) * 100)

    return {
        "cv_count": cv_count,
        "progress": min(progress, 100),
        "studied_questions": studied_questions,
        "quiz_count": quiz_count,
        "quiz_avg": quiz_avg,
        "checklist_count": checklist_count,
        "profile_done": profile_done,
        "cv_done": cv_done,
        "quiz_done": bool(quiz_count),
    }


@router.get("/activity")
def get_activity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from datetime import datetime, timezone, date as date_type
    from app.models.cv import CV
    from app.models.progress import UserQuizResult, UserFlashcardProgress
    from app.models.scholarship_checklist import UserScholarshipChecklist
    from app.models.audit_log import AuditLog
    from sqlalchemy import func as sqlfunc, cast, Date

    _EPOCH = datetime.min.replace(tzinfo=timezone.utc)

    def _aware(dt) -> datetime:
        """Ensure datetime is timezone-aware UTC."""
        if dt is None:
            return _EPOCH
        if isinstance(dt, date_type) and not isinstance(dt, datetime):
            return datetime(dt.year, dt.month, dt.day, tzinfo=timezone.utc)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    events = []

    for cv in db.query(CV).filter(CV.user_id == current_user.id).all():
        events.append({"type": "cv", "label": "CV үүсгэсэн", "detail": cv.name, "ts": _aware(cv.created_at)})
        if cv.updated_at and _aware(cv.updated_at) > _aware(cv.created_at):
            events.append({"type": "cv_edit", "label": "CV засварласан", "detail": cv.name, "ts": _aware(cv.updated_at)})

    for qr in db.query(UserQuizResult).filter(UserQuizResult.user_id == current_user.id).all():
        events.append({
            "type": "quiz",
            "label": "Quiz дүүргэсэн",
            "detail": f"{qr.correct}/{qr.total} ({int(qr.percentage)}%)",
            "ts": _aware(qr.created_at),
        })

    flashcard_days = (
        db.query(cast(UserFlashcardProgress.viewed_at, Date), sqlfunc.count(UserFlashcardProgress.id))
        .filter(UserFlashcardProgress.user_id == current_user.id)
        .group_by(cast(UserFlashcardProgress.viewed_at, Date))
        .order_by(cast(UserFlashcardProgress.viewed_at, Date).desc())
        .all()
    )
    for day, cnt in flashcard_days:
        ts = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        events.append({"type": "flashcard", "label": "Flashcard судалсан", "detail": f"{cnt} асуулт", "ts": ts})

    for cl in db.query(UserScholarshipChecklist).filter(UserScholarshipChecklist.user_id == current_user.id).all():
        events.append({"type": "checklist", "label": "Тэтгэлгийн checklist", "detail": "Шинэчилсэн", "ts": _aware(cl.updated_at)})

    for log in (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id, AuditLog.action.in_(["login", "profile_update"]))
        .order_by(AuditLog.created_at.desc())
        .limit(5)
        .all()
    ):
        label = "Системд нэвтэрсэн" if log.action == "login" else "Профайл шинэчилсэн"
        events.append({"type": log.action, "label": label, "detail": None, "ts": _aware(log.created_at)})

    events.sort(key=lambda e: e["ts"], reverse=True)

    return [
        {
            "type": e["type"],
            "label": e["label"],
            "detail": e["detail"],
            "created_at": e["ts"].isoformat() if e["ts"] != _EPOCH else None,
        }
        for e in events[:15]
    ]


@router.post("/change-password")
@limiter.limit("5/minute")
def change_password(request: Request, data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Хуучин нууц үг буруу байна")

    _validate_password_strength(data.new_password)

    if data.old_password == data.new_password:
        raise HTTPException(status_code=400, detail="Шинэ нууц үг хуучнаасаа ялгаатай байх ёстой")

    current_user.password = hash_password(data.new_password)
    db.commit()
    write_audit_log(db, current_user.id, "password_change", request)
    return {"message": "Нууц үг амжилттай солигдлоо"}


@router.delete("/me")
def delete_my_account(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    write_audit_log(db, current_user.id, "account_delete", request, details=current_user.email)
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

    send_welcome_email(user.email, user.first_name)

    return {"message": "И-мэйл хаяг амжилттай баталгаажлаа! Одоо нэвтэрч болно."}


_EMAIL_COOLDOWN_SECONDS = 120


def _check_email_cooldown(db: Session, user: User, token_type: TokenType):
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=_EMAIL_COOLDOWN_SECONDS)
    recent = db.query(EmailToken).filter(
        EmailToken.user_id == user.id,
        EmailToken.token_type == token_type,
        EmailToken.created_at >= cutoff,
    ).first()
    if recent:
        raise HTTPException(
            status_code=429,
            detail=f"Хэт олон хүсэлт. {_EMAIL_COOLDOWN_SECONDS // 60} минутын дараа дахин оролдоно уу."
        )


@router.post("/resend-verification")
@limiter.limit("3/minute")
def resend_verification(request: Request, response: Response, data: ResendVerificationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and not user.is_verified:
        _check_email_cooldown(db, user, TokenType.verify_email)
        token = _create_token(db, user, TokenType.verify_email, hours=24)
        background_tasks.add_task(send_verification_email, user.email, user.first_name, token)
    return {"message": "Хэрэв тухайн и-мэйл бүртгэлтэй бол баталгаажуулах линк илгээгдсэн."}


# ------- Password reset -------

@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, response: Response, data: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and user.is_active:
        _check_email_cooldown(db, user, TokenType.reset_password)
        token = _create_token(db, user, TokenType.reset_password, hours=1)
        background_tasks.add_task(send_password_reset_email, user.email, user.first_name, token)
    return {"message": "Хэрэв тухайн и-мэйл бүртгэлтэй бол нууц үг сэргээх линк илгээгдсэн."}


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, response: Response, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    _validate_password_strength(data.new_password)

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