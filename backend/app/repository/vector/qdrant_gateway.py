from __future__ import annotations
from typing import Sequence
from qdrant_client import QdrantClient, models


class QdrantGateway:
    def __init__(self, client: QdrantClient, collection: str):
        self.client = client
        self.collection = collection

    def upsert(
        self,
        ids: Sequence[str],
        vectors: Sequence[Sequence[float]],
        payloads: Sequence[dict],
    ):
        points = [
            models.PointStruct(id=i, vector=v, payload=p)
            for i, v, p in zip(ids, vectors, payloads)
        ]
        self.client.upsert(collection_name=self.collection, points=points)
