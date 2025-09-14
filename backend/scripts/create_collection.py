from __future__ import annotations
import os
from qdrant_client import QdrantClient, models

COLLECTION = os.environ.get("QDRANT_COLLECTION", "ask_guruji_docs")
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")

EMBED_DIM = int(os.environ.get("EMBED_DIM", "768"))
DISTANCE = os.environ.get("EMBED_DISTANCE", "COSINE").upper()

distance_map = {
    "COSINE": models.Distance.COSINE,
    "DOT": models.Distance.DOT,
    "EUCLID": models.Distance.EUCLID,
}


def main():
    client = QdrantClient(url=QDRANT_URL)
    client.recreate_collection(
        collection_name=COLLECTION,
        vectors_config=models.VectorParams(
            size=EMBED_DIM,
            distance=distance_map.get(DISTANCE, models.Distance.COSINE),
        ),
    )
    print(
        f"✅ Collection {COLLECTION} ready at {QDRANT_URL} (dim={EMBED_DIM}, distance={DISTANCE})"
    )


if __name__ == "__main__":
    main()
