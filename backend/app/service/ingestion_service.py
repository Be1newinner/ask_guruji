from __future__ import annotations
from pathlib import Path
from typing import Iterable


class IngestionService:
    def __init__(self, storage_root: Path):
        self.storage_root = storage_root

    def discover_pdfs(self) -> Iterable[Path]:
        return sorted(self.storage_root.rglob("*.pdf"))

    def extract_text(self, pdf_path: Path) -> str:
        # TODO
        raise NotImplementedError

    def chunk(self, text: str) -> list[str]:
        # TODO
        raise NotImplementedError

    def embed(self, chunks: list[str]) -> list[list[float]]:
        # TODO
        raise NotImplementedError

    def upsert(self, vectors: list[list[float]], payloads: list[dict]) -> None:
        # TODO
        raise NotImplementedError
