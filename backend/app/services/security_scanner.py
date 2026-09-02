import re
from ..logger import logger
from .audit_service import audit_service

class SecurityViolationError(Exception):
    """Raised when a patch contains a security violation."""
    pass

class SecretScanner:
    """
    Defensive Security Engine.
    Scans raw text (like git diffs or source files) for hardcoded secrets, tokens, and keys.
    """
    def __init__(self):
        # Dictionary of rule_name -> {pattern, severity, description}
        self.rules = {
            "AWS_ACCESS_KEY": {
                "pattern": r"(?i)AKIA[0-9A-Z]{16}",
                "severity": "CRITICAL",
                "description": "Exposed AWS IAM Access Key ID"
            },
            "GENERIC_SECRET_ASSIGNMENT": {
                "pattern": r"(?i)(password|secret|api_key|token)[\s:=]+['\"][a-zA-Z0-9\-_]{8,}['\"]",
                "severity": "HIGH",
                "description": "Hardcoded credential or API secret assignment"
            },
            "PRIVATE_KEY": {
                "pattern": r"-----BEGIN (RSA |DSA |EC |OPENSSH |)PRIVATE KEY-----",
                "severity": "CRITICAL",
                "description": "Unencrypted Private Key Block"
            },
            "GITHUB_TOKEN": {
                "pattern": r"(?i)(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}",
                "severity": "CRITICAL",
                "description": "Exposed GitHub Personal Access Token"
            }
        }

    def inspect_content(self, content: str) -> list:
        """
        Scans arbitrary content and returns a list of detected findings without raising an exception.
        """
        findings = []
        for rule_name, rule_data in self.rules.items():
            matches = list(re.finditer(rule_data["pattern"], content))
            for m in matches:
                # Mask matched secret for safe reporting
                val = m.group(0)
                masked_val = val[:4] + "*" * (len(val) - 8) + val[-4:] if len(val) > 8 else "***"
                findings.append({
                    "rule": rule_name,
                    "severity": rule_data["severity"],
                    "description": rule_data["description"],
                    "match_snippet": masked_val
                })
        return findings

    def scan_patch(self, patch_content: str, target: str = "AI Patch") -> None:
        """
        Scans the patch for secrets. Raises SecurityViolationError and logs to audit trail if found.
        """
        added_lines = [line for line in patch_content.split('\n') if line.startswith('+') and not line.startswith('+++')]
        text_to_scan = '\n'.join(added_lines)

        findings = self.inspect_content(text_to_scan)
        if findings:
            violation_summary = f"Detected {len(findings)} secret(s) in {target}: {', '.join([f['rule'] for f in findings])}"
            audit_service.log_event(
                event_type="SECURITY_BLOCK",
                summary=violation_summary,
                actor="SECURITY_SCANNER",
                severity="CRITICAL",
                target=target,
                details={"findings": findings}
            )
            logger.error(f"Security Scanner blocked patch! {violation_summary}")
            raise SecurityViolationError(f"Security Alert: {violation_summary}. Commit aborted.")
            
        audit_service.log_event(
            event_type="SECURITY_SCAN_PASSED",
            summary=f"Defensive security scan passed clean for {target}",
            actor="SECURITY_SCANNER",
            severity="SUCCESS",
            target=target
        )

security_scanner = SecretScanner()
