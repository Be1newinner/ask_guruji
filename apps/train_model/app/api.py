import os
import shutil
from fastapi import FastAPI, UploadFile, File
from app.services.pdf_processor import process_pdf

app = FastAPI(docs_url="/")


@app.post("/train")
async def train_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF file, processes it, and stores the embeddings in Qdrant.
    """
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)

    try:
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        total_chunks = process_pdf(file_path)

        return {"total_chunks_exported": total_chunks}

    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )
