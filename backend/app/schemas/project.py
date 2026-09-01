from pydantic import BaseModel
from typing import Optional, List

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    environment: Optional[str] = "production"
    repository_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    # Avoiding complex relationships in schema for MVP to prevent circular imports

    class Config:
        from_attributes = True

class ProjectWithStatus(Project):
    status: str = "Unknown"
    latency: Optional[int] = None
