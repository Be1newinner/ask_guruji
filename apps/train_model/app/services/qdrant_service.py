import uuid
from qdrant_client import QdrantClient
from app.config import QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME, EMBEDDING_SIZE

# Create a namespace for generating deterministic UUIDs
NAMESPACE_UUID = uuid.uuid5(uuid.NAMESPACE_DNS, "ask-guruji.com")


def get_qdrant_client():
    """Initializes and returns the Qdrant client."""
    return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)


def ensure_collection_exists(client: QdrantClient):
    """Checks if the collection exists and creates it if it doesn't."""
    try:
        client.get_collection(collection_name=COLLECTION_NAME)
    except Exception:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config={"size": EMBEDDING_SIZE, "distance": "Cosine"},
        )


def upsert_embedding(
    client: QdrantClient, pdf_path: str, i: int, text: str, embeddings
):
    """Upserts a single embedding into the Qdrant collection."""
    if embeddings.shape[1] == EMBEDDING_SIZE:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                {
                    "id": str(uuid.uuid5(NAMESPACE_UUID, f"{pdf_path}-{i}")),
                    "vector": embeddings[0].tolist(),
                    "payload": {"text": text},
                }
            ],
        )
    else:
        print(
            f"Skipping chunk with unexpected embedding dimension: {embeddings.shape[1]}"
        )
