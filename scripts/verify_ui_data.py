import urllib.request
import json

BASE_URL = "https://sre-4vhw.onrender.com"

CHECKS = [
    ("/api/v1/system/health", "System Diagnostics Telemetry"),
    ("/api/v1/projects/", "Project & Monitor List"),
    ("/api/v1/policies/", "SRE Policy Engine Guardrails"),
    ("/api/v1/metrics/slo", "Prometheus SLO Compliance & Latency"),
    ("/api/v1/status/public", "Public Status Page Services"),
    ("/api/v1/approvals/", "Approvals Gateway Items"),
    ("/api/v1/audit/", "Immutable Audit Ledger"),
    ("/api/v1/users/", "Team RBAC Directory")
]

def verify():
    print(f"\n=======================================================")
    print(f"🔍 Verifying Live UI Data Feeds on {BASE_URL}")
    print(f"=======================================================\n")

    for path, name in CHECKS:
        url = f"{BASE_URL}{path}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AIGRA-Verifier/1.0'})
            with urllib.request.urlopen(req, timeout=10) as res:
                raw = res.read().decode('utf-8')
                data = json.loads(raw)
                
                if isinstance(data, list):
                    sample = f"{len(data)} items returned"
                elif isinstance(data, dict):
                    keys = ", ".join(list(data.keys())[:4])
                    sample = f"Keys: [{keys}]"
                else:
                    sample = str(data)[:40]

                print(f"  ✅ [200 OK] {name.ljust(35)} -> {sample}")
        except Exception as e:
            print(f"  ❌ [ERROR]  {name.ljust(35)} -> {str(e)}")

    print(f"\n=======================================================\n")

if __name__ == "__main__":
    verify()
