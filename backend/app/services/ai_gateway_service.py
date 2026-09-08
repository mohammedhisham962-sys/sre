"""
Edge AI LLM Inference Gateway & Prompt Guardrails Service for AIGRA Ops.
Routes multi-provider LLM requests (Gemini, Claude, LLaMA), tracks token budgets,
and intercepts prompt injection attacks and secret exfiltration attempts.
"""

from datetime import datetime
from typing import Dict, Any, List
import re

LLM_PROVIDERS = [
    {
        "provider": "Google Gemini 1.5 Pro",
        "role": "Complex Code & Multi-Modal Triage",
        "p95_latency_ms": 420,
        "error_rate_pct": 0.02,
        "daily_token_quota": 500000,
        "tokens_used_today": 340000,
        "cost_per_1k_tokens_usd": 0.0035,
        "status": "HEALTHY"
    },
    {
        "provider": "Anthropic Claude 3.5 Sonnet",
        "role": "Deep Architectural Synthesis",
        "p95_latency_ms": 580,
        "error_rate_pct": 0.01,
        "daily_token_quota": 300000,
        "tokens_used_today": 126000,
        "cost_per_1k_tokens_usd": 0.0080,
        "status": "HEALTHY"
    },
    {
        "provider": "Meta LLaMA-3 70B (Groq LPU)",
        "role": "Sub-Second Incident Triage & Runbooks",
        "p95_latency_ms": 190,
        "error_rate_pct": 0.04,
        "daily_token_quota": 1000000,
        "tokens_used_today": 810000,
        "cost_per_1k_tokens_usd": 0.0008,
        "status": "HEALTHY"
    }
]

INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"(?i)system\s+prompt\s+extraction",
    r"(?i)bypass\s+safety\s+filter",
    r"(?i)output\s+(all\s+)?env(ironment)?\s+variables",
    r"(?i)exfiltrate\s+secret"
]


class AiGatewayService:
    """
    Manages LLM gateway routing, token quotas, and prompt guardrails.
    """

    @staticmethod
    def get_status() -> Dict[str, Any]:
        total_quota = sum(p["daily_token_quota"] for p in LLM_PROVIDERS)
        total_used = sum(p["tokens_used_today"] for p in LLM_PROVIDERS)

        return {
            "gateway_status": "ACTIVE_PROTECTION",
            "active_providers_count": len(LLM_PROVIDERS),
            "total_tokens_used_today": total_used,
            "total_token_quota": total_quota,
            "quota_utilization_pct": round((total_used / total_quota) * 100.0, 1),
            "providers": LLM_PROVIDERS,
            "blocked_attacks_24h": 14,
            "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def sanitize_prompt(prompt_text: str) -> Dict[str, Any]:
        """
        Evaluates prompt against prompt-injection signatures and PII leak regexes.
        """
        detected_threats = []
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern, prompt_text):
                detected_threats.append(f"Prompt injection signature matched: `{pattern}`")

        # Check for simulated secret leaks
        if re.search(r"(?i)(akid|secret_key|bearer\s+[a-z0-9_\-\.]{20,})", prompt_text):
            detected_threats.append("Simulated credential / API token detected in prompt payload.")

        is_safe = len(detected_threats) == 0
        status = "SAFE" if is_safe else "BLOCKED"

        return {
            "status": status,
            "is_safe": is_safe,
            "threats_count": len(detected_threats),
            "threats": detected_threats,
            "sanitized_tokens_count": len(prompt_text.split()),
            "evaluated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
