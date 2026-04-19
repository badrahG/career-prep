from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.cv import CV
from app.schemas.user import UserAdminResponse, UserUpdateAdmin
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: ensures only admins can access these endpoints"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Зөвхөн админ хандах эрхтэй")
    return current_user


@router.get("/users", response_model=List[UserAdminResponse])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin requirement #2: list, search, filter users"""
    query = db.query(User)

    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(User.first_name).like(like),
                func.lower(User.last_name).like(like),
                func.lower(User.email).like(like),
            )
        )
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    # Attach cv_count for each user
    result = []
    for u in users:
        cv_count = db.query(CV).filter(CV.user_id == u.id).count()
        result.append(UserAdminResponse(
            id=u.id,
            first_name=u.first_name,
            last_name=u.last_name,
            email=u.email,
            phone=u.phone,
            role=u.role.value if hasattr(u.role, "value") else u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            cv_count=cv_count,
        ))
    return result


@router.get("/users/{user_id}", response_model=UserAdminResponse)
def get_user_detail(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")
    cv_count = db.query(CV).filter(CV.user_id == user.id).count()
    return UserAdminResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, "value") else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        cv_count=cv_count,
    )


@router.put("/users/{user_id}", response_model=UserAdminResponse)
def update_user(
    user_id: int,
    data: UserUpdateAdmin,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin requirement #3: activate/suspend, change role"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")

    # Don't allow admin to suspend or demote themselves
    if user.id == admin.id and (data.is_active is False or data.role == "user"):
        raise HTTPException(status_code=400, detail="Өөрийнхөө эрхийг өөрчлөх боломжгүй")

    if data.role is not None:
        if data.role not in ("user", "admin"):
            raise HTTPException(status_code=400, detail="Буруу role")
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)

    cv_count = db.query(CV).filter(CV.user_id == user.id).count()
    return UserAdminResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        role=user.role.value if hasattr(user.role, "value") else user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        cv_count=cv_count,
    )


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Admin requirement #3: permanently delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Хэрэглэгч олдсонгүй")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Өөрийгөө устгах боломжгүй")

    db.delete(user)
    db.commit()
    return {"message": "Хэрэглэгч устгагдлаа"}


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Admin requirement #8: system statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_admins = db.query(User).filter(User.role == "admin").count()
    total_cvs = db.query(CV).count()
    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": total_users - active_users,
        "total_admins": total_admins,
        "total_cvs": total_cvs,
    }