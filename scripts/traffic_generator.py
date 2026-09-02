import urllib.request
import time
import random
import sys

BASE_URL = "https://sre-4vhw.onrender.com"

ENDPOINTS = [
    "/health",
    "/api/v1/system/health",
    "/metrics",
    "/api/v1/metrics/slo",
    "/api/v1/status/public",
    "/api/v1/policies/",
    "/api/v1/projects/",
    "/api/v1/incidents/",
    "/api/v1/audit/"
]

def generate_traffic(iterations=20, delay=1.0):
    print(f"🚦 Starting Synthetic Traffic Generator on {BASE_URL}")
    print(f"Generating {iterations} request cycles with {delay}s interval...\n")

    for i in range(1, iterations + 1):
        path = random.choice(ENDPOINTS)
        url = f"{BASE_URL}{path}"
        start = time.time()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'AIGRA-TrafficGen/1.0'})
            with urllib.request.urlopen(req, timeout=10) as res:
                latency = round((time.time() - start) * 1000, 1)
                print(f"[{i}/{iterations}] HTTP {res.getcode()} -> {path} ({latency}ms)")
        except Exception as e:
            print(f"[{i}/{iterations}] ⚠️ Request error on {path}: {str(e)}")

        time.sleep(delay)

    print(f"\n✅ Traffic generation run finished. Telemetry updated on dashboard!")

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    generate_traffic(iterations=count, delay=0.5)
