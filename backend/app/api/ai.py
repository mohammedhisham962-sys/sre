from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..agents.creation_agent import creation_agent
from ..services.auth_service import get_current_user, require_role
from ..models.user import User

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

@router.post("/generate-and-host")
async def generate_and_host_app(
    request: PromptRequest, 
    current_user: User = Depends(require_role(["ADMIN", "ENGINEER"]))
):
    """
    Takes a single natural language prompt.
    The AI automatically analyzes, writes code, tests, hosts, and returns the live URL.
    """
    result = await creation_agent.generate_and_host(request.prompt, user_role=current_user.role)
    return result
