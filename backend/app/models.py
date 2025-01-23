from pydantic import BaseModel
from datetime import datetime
from enum import Enum
from typing import Optional

class JobComplexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class JobStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class JobRequest(BaseModel):
    location: str
    complexity: JobComplexity
    preferred_date: datetime
    description: Optional[str] = None

class Contractor(BaseModel):
    id: str
    name: str
    location: str
    availability: bool = True
    specialties: list[JobComplexity]

class Job(BaseModel):
    id: str
    request: JobRequest
    status: JobStatus = JobStatus.PENDING
    contractor_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
