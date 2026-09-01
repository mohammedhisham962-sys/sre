import re
from ..logger import logger

class SecurityViolationError(Exception):
    """Raised when a patch contains a security violation."""
    pass

class SecretScanner:
    """
    Defensive Security Engine.
    Scans raw text (like git diffs) for hardcoded secrets, tokens, and keys.
    """
    def __init__(self):
        # Dictionary of rule_name -> regex_pattern
        self.rules = {
            "AWS_ACCESS_KEY": r"(?i)AKIA[0-9A-Z]{16}",
            "GENERIC_SECRET_ASSIGNMENT": r"(?i)(password|secret|api_key|token)[\s:=]+['\"][a-zA-Z0-9\-_]{8,}['\"]",
            "PRIVATE_KEY": r"-----BEGIN (RSA |DSA |EC |OPENSSH |)PRIVATE KEY-----",
            "GITHUB_TOKEN": r"(?i)(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}"
        }

    def scan_patch(self, patch_content: str) -> None:
        """
        Scans the patch for secrets. Raises SecurityViolationError if found.
        """
        # Only scan the added lines in a unified diff to avoid false positives 
        # on code that was already there and just being moved.
        added_lines = [line for line in patch_content.split('\n') if line.startswith('+') and not line.startswith('+++')]
        text_to_scan = '\n'.join(added_lines)

        for rule_name, pattern in self.rules.items():
            matches = re.finditer(pattern, text_to_scan)
            for match in matches:
                logger.error(f"Security Scanner blocked patch! Rule violated: {rule_name}")
                raise SecurityViolationError(f"Security Alert: The AI generated a patch containing a hardcoded secret matching rule '{rule_name}'. Commit aborted.")

security_scanner = SecretScanner()
