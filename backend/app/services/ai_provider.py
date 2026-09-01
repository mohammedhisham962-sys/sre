import httpx
import json
import os
from typing import Dict, Any

class FreeCloudAIProvider:
    """
    Zero-Cost Cloud AI Provider.
    Defaults to Groq's lightning-fast Free Tier (using Llama 3). 
    No credit card required. If no API key is provided, it returns mock responses 
    so the app never crashes.
    """
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama3-8b-8192"

    async def _call_api(self, prompt: str) -> str:
        if not self.api_key:
            print("WARNING: No GROQ_API_KEY found. Returning mock AI response for zero-cost testing.")
            return '{"root_cause": "Mocked memory leak detected.", "recommended_fix": "Increase container RAM.", "approved_for_testing": true}'
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f'{{"error": "API Error: {str(e)}"}}'

    async def analyze_incident(self, incident_details: str, safe_logs: list) -> Dict[str, Any]:
        prompt = f"Analyze this incident: {incident_details}. Logs: {safe_logs}. Return strictly JSON with 'root_cause' and 'recommended_fix'."
        response_text = await self._call_api(prompt)
        
        try:
            return json.loads(response_text)
        except:
            return {"root_cause": "Failed to parse AI JSON.", "raw_response": response_text[:100]}

    async def generate_repair_plan(self, root_cause: str) -> str:
        prompt = f"Generate a python code patch to fix this root cause: {root_cause}. Return only the code."
        return await self._call_api(prompt)

    async def review_patch(self, patch: str) -> Dict[str, Any]:
        prompt = f"Review this code patch: {patch}. Return strictly JSON with boolean 'approved_for_testing'."
        response_text = await self._call_api(prompt)
        try:
            return json.loads(response_text)
        except:
            return {"approved_for_testing": False, "review_summary": "Failed to parse"}

    async def generate_patch(self, incident_logs: str, codebase_structure: str) -> str:
        prompt = f"""
You are an expert SRE AI. 
Incident Logs: {incident_logs}
Codebase Structure: {codebase_structure}

Based on the logs, generate a unified diff patch to fix the issue.
IMPORTANT RULES:
1. ONLY return the raw text of the patch.
2. DO NOT wrap it in markdown block (no ```diff ... ```).
3. DO NOT include any conversational text.
4. The patch must be valid and applicable via 'git apply'.
"""
        return await self._call_api(prompt)

# Singleton instance to be used across the application
ai_provider = FreeCloudAIProvider()
