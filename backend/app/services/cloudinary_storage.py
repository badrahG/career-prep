import os
from typing import Optional

import cloudinary
import cloudinary.uploader

_configured = False


def _configure() -> bool:
    global _configured
    if _configured:
        return True

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()

    if not (cloud_name and api_key and api_secret):
        return False

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    _configured = True
    return True


def is_enabled() -> bool:
    return _configure()


def upload_bytes(
    content: bytes,
    folder: str,
    public_id: Optional[str] = None,
    resource_type: str = "image",
) -> Optional[str]:
    if not _configure():
        return None

    result = cloudinary.uploader.upload(
        content,
        folder=folder,
        public_id=public_id,
        overwrite=False,
        resource_type=resource_type,
        access_mode="public",
    )
    return result.get("secure_url")


def upload_pdf(
    content: bytes,
    folder: str,
    public_id: str,
) -> Optional[dict]:
    """PDF файл Cloudinary-д upload хийж URL болон public_id буцаана."""
    if not _configure():
        return None

    result = cloudinary.uploader.upload(
        content,
        folder=folder,
        public_id=public_id,
        overwrite=True,
        resource_type="raw",
        access_mode="public",
        use_filename=False,
    )
    url = result.get("secure_url", "")
    # URL-д .pdf байхгүй бол нэмнэ
    if url and not url.endswith(".pdf"):
        url = url + ".pdf"
    return {
        "url": url,
        "public_id": result.get("public_id"),
    }


def delete_file(public_id: str, resource_type: str = "raw") -> bool:
    """Cloudinary-с файл устгана."""
    if not _configure():
        return False

    result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    return result.get("result") == "ok"
