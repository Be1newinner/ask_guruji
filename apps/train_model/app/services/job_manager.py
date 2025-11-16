from typing import Dict, Any

jobs: Dict[str, Dict[str, Any]] = {}


def create_job(job_id: str):
    """Initializes a new job with a 'processing' status."""
    jobs[job_id] = {"status": "processing", "progress": 0, "total": 0}


def get_job(job_id: str):
    """Retrieves the status of a specific job."""
    return jobs.get(job_id)


def update_job_progress(job_id: str, progress: int, total: int):
    """Updates the progress of a running job."""
    if job_id in jobs and jobs[job_id]["status"] == "processing":
        jobs[job_id]["progress"] = progress
        jobs[job_id]["total"] = total


def complete_job(job_id: str):
    """Marks a job as 'completed'."""
    if job_id in jobs:
        jobs[job_id]["status"] = "completed"


def stop_job(job_id: str):
    """Marks a job as 'stopped'."""
    if job_id in jobs:
        jobs[job_id]["status"] = "stopped"


def delete_job(job_id: str):
    """Deletes a job from the records."""
    if job_id in jobs:
        del jobs[job_id]
