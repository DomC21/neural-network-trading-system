from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.models import JobRequest, Job, JobStatus
from app.services.job_service import JobService
from app.services.notification_service import NotificationService
from app.services.chatbot_service import ChatbotService

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize services
job_service = JobService()
notification_service = NotificationService()
chatbot_service = ChatbotService()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/jobs", response_model=Job)
async def create_job(request: JobRequest):
    job = job_service.create_job(request)
    job = job_service.assign_contractor(job.id)
    return job

@app.get("/jobs", response_model=List[Job])
async def list_jobs():
    return job_service.get_jobs()

@app.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    try:
        return job_service.get_job(job_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Job not found")

@app.post("/chat")
async def chat(message: str):
    response = chatbot_service.get_response(message)
    return {"response": response}
