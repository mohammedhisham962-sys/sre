from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..services.ai_provider import ai_provider

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Sends conversational messages to the SRE AI Assistant.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")
        
    formatted_messages = [{"role": m.role, "content": m.content} for m in request.messages]
    reply_text = await ai_provider.chat(formatted_messages)
    return {"reply": reply_text}
