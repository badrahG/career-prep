import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

from app.database import get_db
from app.models.certificate import Certificate
from app.models.user import User
from app.services.auth import get_current_user
from app.services import cloudinary_storage

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])

VOLUNTEERCHAIN_BASE_URL = os.getenv(
    "VOLUNTEERCHAIN_BASE_URL", "https://volunteerchain-backend.onrender.com"
)
VOLUNTEERCHAIN_API_KEY = os.getenv("VOLUNTEERCHAIN_API_KEY", "")


# ── Response schema ────────────────────────────────────────────────────────────

class CertificateResponse(BaseModel):
    id: int
    title: str
    issued_date: Optional[date] = None
    cloudinary_url: Optional[str] = None
    external_id: Optional[int] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True


# ── GET /api/certificates ──────────────────────────────────────────────────────

@router.get("", response_model=List[CertificateResponse])
def list_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Хэрэглэгчийн бүх certificate жагсаана."""
    certs = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.created_at.desc())
        .all()
    )
    return certs


# ── POST /api/certificates/fetch ──────────────────────────────────────────────

@router.post("/fetch")
def fetch_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Найзын системээс (VolunteerChain) хэрэглэгчийн certificate-үүдийг татаж
    Cloudinary-д upload хийн DB-д хадгална.
    """
    # 1. Оюутны код байгаа эсэх шалгана
    if not current_user.student_code:
        raise HTTPException(
            status_code=400,
            detail="Оюутны код оруулаагүй байна. Профайл хуудсанд оюутны кодоо нэмнэ үү.",
        )

    if not VOLUNTEERCHAIN_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="VolunteerChain API тохиргоо хийгдээгүй байна.",
        )

    headers = {"x-api-key": VOLUNTEERCHAIN_API_KEY}
    student_code = current_user.student_code

    # 2. ID=1,2,3... дараалан шалгаж PDF татна (жагсаалт хаяг байхгүй)
    added = 0
    skipped = 0
    MAX_PROBE = 20  # хамгийн ихдээ 20 хүртэл шалгана

    for external_id in range(1, MAX_PROBE + 1):
        pdf_url = (
            f"{VOLUNTEERCHAIN_BASE_URL}/api/external/students/{student_code}"
            f"/certifications/{external_id}/pdf"
        )
        try:
            pdf_resp = requests.get(pdf_url, headers=headers, timeout=30)
        except requests.RequestException:
            raise HTTPException(status_code=503, detail="VolunteerChain систем рүү холбогдож чадсангүй.")

        # 404 эсвэл амжилтгүй → дараагийн ID байхгүй гэж үзэж зогсооно
        if pdf_resp.status_code == 404:
            break
        if pdf_resp.status_code == 401:
            raise HTTPException(status_code=503, detail="VolunteerChain API key алдаатай байна.")
        if pdf_resp.status_code != 200:
            continue

        pdf_bytes = pdf_resp.content

        # PDF мөн эсэх шалгана (хамгийн багадаа 1KB байх ёстой)
        if len(pdf_bytes) < 1024:
            break

        # Давтагдсан эсэх шалгана
        existing = (
            db.query(Certificate)
            .filter(
                Certificate.user_id == current_user.id,
                Certificate.external_id == external_id,
                Certificate.source == "volunteerchain",
            )
            .first()
        )
        public_id = f"cert_{current_user.id}_{external_id}.pdf"

        if existing:
            # URL-д .pdf байхгүй бол дахин upload хийж шинэчилнэ
            if existing.cloudinary_url and existing.cloudinary_url.endswith(".pdf"):
                skipped += 1
                continue
            cloud_result = cloudinary_storage.upload_pdf(
                content=pdf_bytes,
                folder="certificates",
                public_id=public_id,
            )
            if cloud_result:
                existing.cloudinary_url = cloud_result["url"]
                existing.cloudinary_public_id = cloud_result["public_id"]
                added += 1
            continue

        # Cloudinary-д upload хийнэ
        cloud_result = cloudinary_storage.upload_pdf(
            content=pdf_bytes,
            folder="certificates",
            public_id=public_id,
        )

        cloudinary_url = cloud_result["url"] if cloud_result else None
        cloudinary_public_id = cloud_result["public_id"] if cloud_result else None

        # DB-д хадгална
        new_cert = Certificate(
            user_id=current_user.id,
            title=f"Гэрчилгээ #{external_id}",
            issued_date=None,
            cloudinary_url=cloudinary_url,
            cloudinary_public_id=cloudinary_public_id,
            external_id=external_id,
            source="volunteerchain",
        )
        db.add(new_cert)
        added += 1

    db.commit()

    return {
        "message": f"{added} certificate нэмэгдлээ.",
        "added": added,
        "skipped": skipped,
    }


# ── DELETE /api/certificates/{id} ─────────────────────────────────────────────

@router.delete("/{cert_id}")
def delete_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Certificate устгана."""
    cert = (
        db.query(Certificate)
        .filter(Certificate.id == cert_id, Certificate.user_id == current_user.id)
        .first()
    )
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate олдсонгүй.")

    # Cloudinary-с устгана
    if cert.cloudinary_public_id:
        cloudinary_storage.delete_file(cert.cloudinary_public_id)

    db.delete(cert)
    db.commit()
    return {"message": "Certificate устгагдлаа."}
