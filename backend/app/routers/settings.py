import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Settings"])

_DEFAULT_PREFS = {
    "scholarship_new": True,
    "scholarship_deadline": True,
    "interview_new": True,
    "advice_new": True,
}


class NotifPrefs(BaseModel):
    scholarship_new: bool = True
    scholarship_deadline: bool = True
    interview_new: bool = True
    advice_new: bool = True


@router.get("/settings")
def get_settings(current_user: User = Depends(get_current_user)):
    prefs = _DEFAULT_PREFS.copy()
    if current_user.notification_prefs:
        try:
            prefs.update(json.loads(current_user.notification_prefs))
        except Exception:
            pass
    return {"notification_prefs": prefs}


@router.put("/settings")
def update_settings(data: NotifPrefs, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.notification_prefs = json.dumps(data.model_dump())
    db.commit()
    return {"ok": True}


@router.get("/login-history")
def get_login_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id, AuditLog.action == "login")
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
