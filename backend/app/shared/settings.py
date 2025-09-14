from __future__ import annotations

import os
import sys
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, ValidationError


class Settings(BaseSettings):
    gemini_api_key: str | None = Field(..., alias="GEMINI_API_KEY")
    root_dir: str | None = Field(..., alias="ROOT_DIR")
    app_env: str | None = Field(..., alias="APP_ENV")

    # first_superuser: str | None = Field(None, alias="FIRST_SUPERUSER")
    # first_superuser_password: str | None = Field(None, alias="FIRST_SUPERUSER_PASSWORD")

    def __init__(self):
        super().__init__()

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    def resolved_root_dir(self) -> Path:
        if not self.root_dir:
            raise ValueError("ROOT_DIR env not loaded")
        return Path(os.path.expandvars(os.path.expanduser(self.root_dir))).resolve()

    def validate_required(self) -> None:
        problems: list[str] = []
        if not self.root_dir:
            problems.append("ROOT_DIR is required")
        if not self.gemini_api_key:
            problems.append("GEMINI_API_KEY is required (needed by Phase 3)")
        if problems:
            raise ValueError(f"Settings validation failed: {'; '.join(problems)}")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    try:
        s = Settings()
        return s
    except ValidationError as e:
        print(f"Configuration Error: {e}", file=sys.stderr)
        raise


def validate_environment() -> bool:
    try:
        s = get_settings()
        _ = s.resolved_root_dir()
        return True
    except ValidationError:
        return False
