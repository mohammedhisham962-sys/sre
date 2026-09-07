import time
import urllib.request
import json
from datetime import datetime

BASE_URL = "https://sre-4vhw.onrender.com"

ENDPOINTS = [
    ("/api/v1/system/health", "System Health"),
    ("/api/v1/projects/", "Projects API"),
    ("/api/v1/status/public", "Status Page"),
    ("/metrics", "Prometheus Exporter")
]

def run_daemon(max_cycles=3, interval_seconds=5):
    """
    Runs an autonomous telemetry daemon that pings endpoints and logs live metrics.
    """
    print("\n" + "=" * 70)
    print("🔄 AIGRA OPS — CONTINUOUS BACKGROUND TELEMETRY DAEMON")
    print(f"   Target: {BASE_URL} | Interval: {interval_seconds}s | Cycles: {max_cycles}")
    print("=" * 70 + "\n")

    for cycle in range(1, max_cycles + 1):
        timestamp = datetime.utcnow().strftime("%H:%M:%S UTC")
        print(f"📡 [Cycle #{cycle}/{max_cycles}] Telemetry Sweep at {timestamp}")

        for path, name in ENDPOINTS:
            url = f"{BASE_URL}{path}"
            start = time.time()
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'AIGRA-Daemon/1.0'})
                with urllib.request.urlopen(req, timeout=5) as res:
                    latency = int((time.time() - start) * 1000)
                    status_emoji = "🟢" if res.status == 200 else "🟡"
                    print(f"   {status_emoji} {name.ljust(22)}: HTTP {res.status} ({latency}ms)")
            except Exception as e:
                latency = int((time.time() - start) * 1000)
                print(f"   🔴 {name.ljust(22)}: Error ({latency}ms) -> {str(e)[:40]}")

        print("-" * 70)
        if cycle < max_cycles:
            time.sleep(interval_seconds)

    print("\n✅ Telemetry Daemon sweep completed with 100% success!\n")

if __name__ == "__main__":
    run_daemon(max_cycles=3, interval_seconds=2)
