from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from app.models import Job
from app.config import settings

class NotificationService:
    def __init__(self):
        # For demo purposes, we'll just print notifications
        # Email configuration would be set up in production
        pass
    
    async def send_job_confirmation(self, email: EmailStr, job: Job):
        # For demo purposes, just print the notification
        print(f"\nSending job confirmation to {email}")
        print(f"Job ID: {job.id}")
        print(f"Status: {job.status}")
        print(f"Location: {job.request.location}")
        print(f"Date: {job.request.preferred_date}\n")
        
    async def send_contractor_assignment(self, contractor_email: EmailStr, job: Job):
        # For demo purposes, just print the notification
        print(f"\nSending assignment notification to {contractor_email}")
        print(f"Job ID: {job.id}")
        print(f"Location: {job.request.location}")
        print(f"Date: {job.request.preferred_date}")
        print(f"Complexity: {job.request.complexity}\n")
