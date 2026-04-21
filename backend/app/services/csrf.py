import hmac
import hashlib
import time
import secrets
import os

_SECRET = os.getenv("SECRET_KEY", "career-platform-secret-key-2024")


def generate_csrf_token() -> str:
    timestamp = str(int(time.time()))
    nonce = secrets.token_hex(8)
    message = f"{timestamp}.{nonce}"
    sig = hmac.new(_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
    return f"{message}.{sig}"


def validate_csrf_token(token: str, max_age: int = 7200) -> bool:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        timestamp_str, nonce, sig = parts
        timestamp = int(timestamp_str)
        if time.time() - timestamp > max_age:
            return False
        message = f"{timestamp_str}.{nonce}"
        expected = hmac.new(_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig)
    except Exception:
        return False
