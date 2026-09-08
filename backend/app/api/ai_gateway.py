from fastapi import APIRouter
from ..services.ai_gateway_service import AiGatewayService
from pydantic import BaseModel

router = APIRouter()

class SanitizePromptRequest(BaseModel):
    prompt: str

@router.get("/status")
def get_ai_gateway_status():
    """
    Returns AI inference gateway status, provider latencies, token consumption, and attack metrics.
    """
    return AiGatewayService.get_status()

@router.post("/sanitize")
def sanitize_prompt_payload(req: SanitizePromptRequest):
    """
    Evaluates and sanitizes a prompt payload against prompt injection and secret exfiltration rules.
    """
    return AiGatewayService.sanitize_prompt(prompt_text=req.prompt)
