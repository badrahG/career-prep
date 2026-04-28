import time
import threading
from typing import Any, Optional

_lock = threading.Lock()
_store: dict[str, tuple[float, Any]] = {}


def cache_get(key: str, ttl: int) -> Optional[Any]:
    with _lock:
        entry = _store.get(key)
        if entry and time.monotonic() - entry[0] < ttl:
            return entry[1]
        _store.pop(key, None)
        return None


def cache_set(key: str, val: Any) -> None:
    with _lock:
        _store[key] = (time.monotonic(), val)


def cache_clear_prefix(prefix: str) -> None:
    with _lock:
        for k in list(_store.keys()):
            if k.startswith(prefix):
                del _store[k]
