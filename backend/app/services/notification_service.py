from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from app.models import Job
from app.config import settings

class NotificationService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_TLS=settings.MAIL_TLS,
            MAIL_SSL=settings.MAIL_SSL,
            USE_CREDENTIALS=True
        )
        self.fastmail = FastMail(self.conf)
    
    async def send_job_confirmation(self, email: EmailStr, job: Job):
        message = MessageSchema(
            subject=f"Job Request Confirmation - {job.id}",
            recipients=[email],
            body=f"""
            Your job request has been received.
            
            Job ID: {job.id}
            Status: {job.status}
            Location: {job.request.location}
            Date: {job.request.preferred_date}
            
            We will notify you when a contractor is assigned.
            """,
            subtype="plain"
        )
        
        try:
            await self.fastmail.send_message(message)
        except Exception as e:
            print(f"Failed to send email: {e}")
            print(f"Would have sent job confirmation to {email}")
            print(f"Job ID: {job.id}")
            print(f"Status: {job.status}")
        
    async def send_contractor_assignment(self, contractor_email: EmailStr, job: Job):
        message = MessageSchema(
            subject=f"New Job Assignment - {job.id}",
            recipients=[contractor_email],
            body=f"""
            You have been assigned a new job.
            
            Job ID: {job.id}
            Location: {job.request.location}
            Date: {job.request.preferred_date}
            Complexity: {job.request.complexity}
            
            Please review the details and confirm your availability.
            """,
            subtype="plain"
        )
        
        try:
            await self.fastmail.send_message(message)
        except Exception as e:
            print(f"Failed to send email: {e}")
            print(f"Would have sent assignment notification to {contractor_email}")
            print(f"Job ID: {job.id}")
            print(f"Location: {job.request.location}")
            print(f"Date: {job.request.preferred_date}")
