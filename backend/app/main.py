from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel, EmailStr

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

class JobSubmission(BaseModel):
    request: JobRequest
    customer_email: EmailStr

@app.post("/jobs", response_model=Job)
async def create_job(submission: JobSubmission):
    # Create and assign job
    job = job_service.create_job(submission.request)
    job = job_service.assign_contractor(job.id)
    
    # Send notifications
    await notification_service.send_job_confirmation(
        email=submission.customer_email,
        job=job
    )
    
    if job.contractor_id:
        contractor = job_service.contractors.get(job.contractor_id)
        if contractor:
            await notification_service.send_contractor_assignment(
                contractor_email=f"{contractor.name.lower().replace(' ', '.')}@example.com",
                job=job
            )
    
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

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat(chat_message: ChatMessage):
    response = chatbot_service.get_response(chat_message.message)
    return {"response": response}
