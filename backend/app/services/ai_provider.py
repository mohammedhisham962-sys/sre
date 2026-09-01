import httpx
import json
import os
from typing import Dict, Any

class LocalAIProvider:
    """
    Zero-Cost Local AI Provider using Ollama.
    """
    def __init__(self, model_name: str = "llama3"):
        # When running in docker, the hostname is 'ollama'. When running locally, it's 'localhost'
        host = os.getenv("OLLAMA_HOST", "ollama")
        self.base_url = f"http://{host}:11434/api/generate"
        self.model_name = model_name

    async def _call_ollama(self, prompt: str) -> str:
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, json=payload, timeout=60.0)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
        except Exception as e:
            print(f"Ollama connection error: {e}")
            return '{"error": "Could not connect to local Ollama instance. Is it running?"}'

    async def analyze_incident(self, incident_details: str, safe_logs: list) -> Dict[str, Any]:
        prompt = f"Analyze this incident: {incident_details}. Logs: {safe_logs}. Return JSON with 'root_cause' and 'recommended_fix'."
        response_text = await self._call_ollama(prompt)
        
        # Fallback parsing in case model doesn't return pure JSON
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "root_cause": "AI Response parsing failed. Raw: " + response_text[:100],
                "recommended_fix": "Review raw output."
            }

    async def generate_repair_plan(self, root_cause: str) -> str:
        prompt = f"Generate a python code patch to fix this root cause: {root_cause}. Return only the code."
        return await self._call_ollama(prompt)

    async def review_patch(self, patch: str) -> Dict[str, Any]:
        prompt = f"Review this code patch for security and syntax issues: {patch}. Return JSON with boolean 'approved_for_testing' and string 'review_summary'."
        response_text = await self._call_ollama(prompt)
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {"approved_for_testing": False, "review_summary": "Failed to parse AI output."}

# Singleton instance to be used across the application
ai_provider = LocalAIProvider(model_name="llama3")
