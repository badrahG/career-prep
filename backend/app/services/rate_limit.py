"""
Rate limiting configuration using slowapi.

Install:
    pip install slowapi

Usage in routers:
    from app.services.rate_limit import limiter

    @router.post("/login")
    @limiter.limit("5/minute")
    def login(request: Request, ...):
        ...
"""
from slowapi import Limiter
from starlette.requests import Request


def get_real_ip(request: Request) -> str:
    # Render / reverse proxy X-Forwarded-For-ээс жинхэнэ IP авна
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host


limiter = Limiter(
    key_func=get_real_ip,
    default_limits=["200/minute"],
    headers_enabled=True,
)