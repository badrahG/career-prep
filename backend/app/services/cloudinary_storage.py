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


def upload_bytes(content: bytes, folder: str, public_id: Optional[str] = None) -> Optional[str]:
    if not _configure():
        return None

    result = cloudinary.uploader.upload(
        content,
        folder=folder,
        public_id=public_id,
        overwrite=False,
        resource_type="auto",
    )
    return result.get("secure_url")
