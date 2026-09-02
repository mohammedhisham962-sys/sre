import pytest
from app.services.security_scanner import security_scanner, SecurityViolationError

def test_scanner_clean_patch():
    clean_diff = """
diff --git a/app/main.py b/app/main.py
--- a/app/main.py
+++ b/app/main.py
@@ -1,3 +1,3 @@
-print("old line")
+print("safe clean code without credentials")
"""
    # Should not raise any exception
    security_scanner.scan_patch(clean_diff, target="Test Clean Diff")
    findings = security_scanner.inspect_content(clean_diff)
    assert len(findings) == 0

def test_scanner_blocks_aws_key():
    malicious_diff = """
+ AWS_ACCESS_KEY_ID = 'AKIA1234567890ABCDEF'
"""
    with pytest.raises(SecurityViolationError) as exc_info:
        security_scanner.scan_patch(malicious_diff, target="Test AWS Key")
    assert "AWS_ACCESS_KEY" in str(exc_info.value)

def test_scanner_blocks_github_token():
    malicious_diff = """
+ GITHUB_TOKEN = 'ghp_123456789012345678901234567890123456'
"""
    with pytest.raises(SecurityViolationError) as exc_info:
        security_scanner.scan_patch(malicious_diff, target="Test GitHub Token")
    assert "GITHUB_TOKEN" in str(exc_info.value)

def test_scanner_blocks_generic_password():
    malicious_diff = """
+ DB_PASSWORD = "mySuperSecretPassword123"
"""
    with pytest.raises(SecurityViolationError) as exc_info:
        security_scanner.scan_patch(malicious_diff, target="Test Password")
    assert "GENERIC_SECRET_ASSIGNMENT" in str(exc_info.value)
