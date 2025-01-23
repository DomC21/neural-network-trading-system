from datetime import datetime
import uuid
from app.models import Job, JobRequest, Contractor, JobStatus, JobComplexity

class JobService:
    def __init__(self):
        self.jobs: dict[str, Job] = {}
        self.contractors: dict[str, Contractor] = {
            "c1": Contractor(
                id="c1",
                name="John Smith",
                location="New York",
                specialties=[JobComplexity.LOW, JobComplexity.MEDIUM]
            ),
            "c2": Contractor(
                id="c2",
                name="Alice Johnson",
                location="Los Angeles",
                specialties=[JobComplexity.MEDIUM, JobComplexity.HIGH]
            ),
            "c3": Contractor(
                id="c3",
                name="Bob Wilson",
                location="Chicago",
                specialties=[JobComplexity.LOW, JobComplexity.MEDIUM, JobComplexity.HIGH]
            )
        }
    
    def create_job(self, request: JobRequest) -> Job:
        job_id = str(uuid.uuid4())
        now = datetime.utcnow()
        job = Job(
            id=job_id,
            request=request,
            created_at=now,
            updated_at=now
        )
        self.jobs[job_id] = job
        return job
    
    def assign_contractor(self, job_id: str) -> Job:
        job = self.jobs.get(job_id)
        if not job:
            raise ValueError("Job not found")
        
        # Find available contractor in the same location
        available_contractors = [
            c for c in self.contractors.values()
            if c.availability and c.location == job.request.location
            and job.request.complexity in c.specialties
        ]
        
        if not available_contractors:
            return job
        
        # Assign the first available contractor
        contractor = available_contractors[0]
        job.contractor_id = contractor.id
        job.status = JobStatus.ASSIGNED
        job.updated_at = datetime.utcnow()
        
        # Update contractor availability
        contractor.availability = False
        self.contractors[contractor.id] = contractor
        
        return job
    
    def get_jobs(self) -> list[Job]:
        return list(self.jobs.values())
    
    def get_job(self, job_id: str) -> Job:
        if job_id not in self.jobs:
            raise ValueError("Job not found")
        return self.jobs[job_id]
