from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from app.shared.settings import get_settings
from app.api.health import router as health_router

logger = logging.getLogger("ask_guruji")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    root = settings.resolved_root_dir()
    root.mkdir(parents=True, exist_ok=True)
    logger.info("App starting: env=%s root_dir=%s", settings.app_env, root)
    try:
        yield
    finally:
        logger.info("App shutdown")


app = FastAPI(title="Ask Guruji RAG API", version="0.1.0", lifespan=lifespan, docs_url="/")

app.include_router(health_router)