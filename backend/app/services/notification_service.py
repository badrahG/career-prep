from sqlalchemy.orm import Session
from app.models.notification import Notification


def push_notification(
    db: Session,
    type: str,
    title: str,
    body: str = None,
    url: str = None,
    ref_key: str = None,
):
    """Create a global notification. ref_key prevents duplicates when provided."""
    try:
        if ref_key:
            exists = db.query(Notification).filter(Notification.ref_key == ref_key).first()
            if exists:
                return
        n = Notification(type=type, title=title, body=body, url=url, ref_key=ref_key)
        db.add(n)
        db.commit()
    except Exception:
        db.rollback()
