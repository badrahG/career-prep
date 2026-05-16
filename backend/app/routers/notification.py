from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification, NotificationRead
from app.models.scholarship import Scholarship
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def _ensure_deadline_notifications(db: Session):
    """Auto-create deadline notifications for scholarships expiring within 7 days."""
    today = date.today()
    soon = (
        db.query(Scholarship)
        .filter(
            Scholarship.deadline != None,
            Scholarship.deadline >= today,
            Scholarship.deadline <= today + timedelta(days=7),
        )
        .all()
    )
    created = False
    for s in soon:
        diff = (s.deadline - today).days
        ref_key = f"deadline_{s.id}_{s.deadline}"
        exists = db.query(Notification).filter(Notification.ref_key == ref_key).first()
        if not exists:
            days_text = "Өнөөдөр дуусна" if diff == 0 else f"{diff} хоног үлдлээ"
            db.add(Notification(
                type="scholarship_deadline",
                title=f"Хугацаа дуусах гэж байна: {s.name}",
                body=days_text,
                url=f"/scholarship/{s.id}",
                ref_key=ref_key,
            ))
            created = True
    if created:
        try:
            db.commit()
        except Exception:
            db.rollback()


@router.get("")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_deadline_notifications(db)

    notifications = (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    read_ids = set(
        r.notification_id
        for r in db.query(NotificationRead)
        .filter(NotificationRead.user_id == current_user.id)
        .all()
    )

    result = [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "url": n.url,
            "is_read": n.id in read_ids,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]
    unread_count = sum(1 for n in result if not n["is_read"])
    return {"notifications": result, "unread_count": unread_count}


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _ensure_deadline_notifications(db)
    total = db.query(Notification).count()
    read_count = (
        db.query(NotificationRead)
        .filter(NotificationRead.user_id == current_user.id)
        .count()
    )
    return {"unread_count": max(0, total - read_count)}


@router.post("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    read_ids = set(
        r.notification_id
        for r in db.query(NotificationRead)
        .filter(NotificationRead.user_id == current_user.id)
        .all()
    )
    all_ids = [n.id for n in db.query(Notification.id).all()]
    for nid in all_ids:
        if nid not in read_ids:
            db.add(NotificationRead(user_id=current_user.id, notification_id=nid))
    db.commit()
    return {"ok": True}


@router.post("/{nid}/read")
def mark_one_read(
    nid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = (
        db.query(NotificationRead)
        .filter(
            NotificationRead.user_id == current_user.id,
            NotificationRead.notification_id == nid,
        )
        .first()
    )
    if not exists:
        db.add(NotificationRead(user_id=current_user.id, notification_id=nid))
        db.commit()
    return {"ok": True}
