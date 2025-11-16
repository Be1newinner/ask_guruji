from langchain_community.document_loaders import PyPDFLoader
from app.services.text_splitter import CleanOCRTextSplitter
from app.embedding.generator import generate
from app.services.qdrant_service import (
    get_qdrant_client,
    ensure_collection_exists,
    upsert_embedding,
)
from app.services.job_manager import update_job_progress, complete_job, get_job


def process_pdf(pdf_path: str, job_id: str):
    """
    Processes a single PDF file, splits it into chunks, generates embeddings,
    and stores them in a Qdrant collection. Updates job progress.
    """
    client = get_qdrant_client()
    ensure_collection_exists(client)

    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    text_splitter = CleanOCRTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    total_chunks = len(chunks)

    for i, chunk in enumerate(chunks):
        job = get_job(job_id)
        if job and job["status"] == "stopped":
            print(f"Job {job_id} stopped.")
            return

        text = chunk.page_content
        embeddings = generate(text)
        upsert_embedding(client, pdf_path, i, text, embeddings)
        update_job_progress(job_id, i + 1, total_chunks)

    complete_job(job_id)
