from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from app.models import Job

class NotificationService:
    async def send_job_confirmation(self, email: EmailStr, job: Job):
        # TODO: Implement email sending logic
        # For demo purposes, we'll just print the notification
        print(f"Sending job confirmation to {email}")
        print(f"Job ID: {job.id}")
        print(f"Status: {job.status}")
        
    async def send_contractor_assignment(self, contractor_email: EmailStr, job: Job):
        # TODO: Implement email sending logic
        print(f"Sending assignment notification to {contractor_email}")
        print(f"Job ID: {job.id}")
        print(f"Location: {job.request.location}")
        print(f"Date: {job.request.preferred_date}")
