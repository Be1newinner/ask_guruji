import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from app.services.pdf_processor import process_pdf
from app.services.job_manager import create_job, get_job, stop_job, delete_job

app = FastAPI(docs_url="/")


@app.post("/train")
async def train_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Accepts a PDF file, processes it in the background, and returns a job ID.
    """
    job_id = str(uuid.uuid4())
    create_job(job_id)

    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)

    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(process_pdf, file_path, job_id)

    return {"job_id": job_id}


@app.get("/train/status/{job_id}")
async def get_training_status(job_id: str):
    """
    Retrieves the status of a training job.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/train/stop/{job_id}")
async def stop_training_job(job_id: str):
    """
    Stops a running training job.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    stop_job(job_id)
    return {"message": "Job stopping."}


@app.delete("/train/delete/{job_id}")
async def delete_training_job(job_id: str):
    """
    Deletes a training job.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    delete_job(job_id)
    return {"message": "Job deleted."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )
