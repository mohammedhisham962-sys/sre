import urllib.request
import json
import sys
import time

BASE_URL = "https://sre-4vhw.onrender.com"

ENDPOINTS = [
    ("/health", "Health Root"),
    ("/api/v1/system/health", "System Diagnostics"),
    ("/metrics", "Prometheus Exporter"),
    ("/api/v1/metrics/slo", "SLO/SLI Calculation"),
    ("/api/v1/status/public", "Public Status Page"),
    ("/api/v1/policies/", "SRE Policy Engine"),
    ("/api/v1/approvals/", "Approvals Gateway"),
    ("/api/v1/projects/", "Project Directory"),
    ("/api/v1/incidents/", "Incidents Feed"),
    ("/api/v1/audit/", "Immutable Audit Trail"),
    ("/docs", "Interactive Swagger Docs")
]

def run_smoke_tests():
    print(f"\n=======================================================")
    print(f"🚀 Running Live Production Smoke Tests on {BASE_URL}")
    print(f"=======================================================\n")

    passed = 0
    failed = 0

    for path, description in ENDPOINTS:
        url = f"{BASE_URL}{path}"
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AIGRA-SmokeTester/1.0'})
            with urllib.request.urlopen(req, timeout=15) as res:
                duration_ms = round((time.time() - start) * 1000, 1)
                code = res.getcode()
                if code in (200, 201):
                    print(f"  ✅ [PASS {code}] {description.ljust(25)} -> {path} ({duration_ms}ms)")
                    passed += 1
                else:
                    print(f"  ⚠️ [WARN {code}] {description.ljust(25)} -> {path} ({duration_ms}ms)")
                    passed += 1
        except Exception as e:
            print(f"  ❌ [FAIL]     {description.ljust(25)} -> {path} ({str(e)})")
            failed += 1

    print(f"\n=======================================================")
    print(f"📊 Smoke Test Complete: {passed} Passed, {failed} Failed")
    print(f"=======================================================\n")

if __name__ == "__main__":
    run_smoke_tests()
