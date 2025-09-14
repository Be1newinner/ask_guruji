from __future__ import annotations

from fastapi import APIRouter
from app.shared.settings import get_settings

router = APIRouter()


@router.get("/health", tags=["health"])
def health():
    s = get_settings()
    return {
        "status": "ok",
        "env": s.app_env,
        "root_dir": str(s.resolved_root_dir()),
    }
