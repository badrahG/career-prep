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
from slowapi.util import get_remote_address

# Limiter instance — keyed by remote IP address
# Default limit applies to routes that don't specify their own
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],  # Generic safety-net limit
    headers_enabled=True,  # Add X-RateLimit-* headers to responses
)