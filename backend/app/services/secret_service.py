import re

class SecretProtectionService:
    """
    Ensures that secrets (API keys, passwords, tokens) are never sent to AI
    or exposed in logs.
    """
    
    # Common regex patterns for secrets
    PATTERNS = {
        "AWS_KEY": r"(?i)AKIA[0-9A-Z]{16}",
        "BEARER_TOKEN": r"(?i)Bearer\s+[a-zA-Z0-9_\-\.]+",
        "PASSWORD_FIELD": r"(?i)(password|passwd|pwd|secret)\s*[:=]\s*['\"][^'\"]+['\"]",
        "GENERIC_KEY": r"(?i)(api_key|apikey|access_token)\s*[:=]\s*['\"][^'\"]+['\"]"
    }

    @staticmethod
    def redact(text: str) -> str:
        if not text:
            return text
            
        redacted_text = text
        for secret_type, pattern in SecretProtectionService.PATTERNS.items():
            redacted_text = re.sub(pattern, f"[REDACTED_{secret_type}]", redacted_text)
            
        return redacted_text
        
secret_service = SecretProtectionService()
