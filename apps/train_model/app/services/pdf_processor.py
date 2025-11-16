from langchain_community.document_loaders import PyPDFLoader
from app.services.text_splitter import CleanOCRTextSplitter
from app.embedding.generator import generate
from app.services.qdrant_service import (
    get_qdrant_client,
    ensure_collection_exists,
    upsert_embedding,
)


def process_pdf(pdf_path: str) -> int:
    """
    Processes a single PDF file, splits it into chunks, generates embeddings,
    and stores them in a Qdrant collection.

    Returns the total number of chunks processed.
    """
    client = get_qdrant_client()
    ensure_collection_exists(client)

    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    text_splitter = CleanOCRTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)

    for i, chunk in enumerate(chunks):
        text = chunk.page_content
        embeddings = generate(text)
        upsert_embedding(client, pdf_path, i, text, embeddings)

    return len(chunks)
