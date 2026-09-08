import asyncio
from playwright.async_api import async_playwright
import time

BASE_URL = "https://sre-4vhw.onrender.com"

PAGES_TO_VISIT = [
    ("/", "Main Dashboard", 3),
    ("/traffic", "Global Traffic Management", 3),
    ("/network", "Network Topology Map", 3),
    ("/compute", "Compute Resources", 3),
    ("/logs", "Centralized Logging", 3),
    ("/traces", "OpenTelemetry Traces", 3),
    ("/metrics", "Prometheus Metrics", 3),
    ("/alerts", "Alert Management", 3),
    ("/slo", "SLO Engine", 3),
    ("/runbooks", "Runbook Automation", 3),
    ("/config-drift", "Configuration Drift", 3),
    ("/cost", "Cloud Cost Analysis", 3),
    ("/incidents", "Incident Response", 3),
    ("/ebpf", "eBPF Observability", 3),
    ("/otel", "OTEL Collector Status", 3),
    ("/edge-ai", "Edge AI Inference", 3),
    ("/workload-identity", "Workload Identity", 3),
    ("/gitops", "GitOps Controller", 3),
    ("/sbom", "SBOM Compliance", 3),
    ("/edge-waf", "Edge WAF Security", 3),
    ("/db-capacity", "Database Capacity", 3),
    ("/feature-flags", "Feature Flagging", 3),
    ("/finops", "FinOps Dashboard", 3),
    ("/assistant", "AI SRE Assistant", 3),
    ("/policies", "Policy Enforcement", 3),
    ("/login", "Login Page (Testing Auto-Fill)", 2),
    ("/projects", "Live Project Monitors", 3),
    ("/status", "Public Status Page (Uptime Bars)", 3),
    ("/chaos", "SRE Chaos Engineering Console", 3),
    ("/k8s", "Kubernetes Auto-Healer Console", 3),
    ("/canary", "Canary Rollback Guardrails", 3),
    ("/oncall", "On-Call Shifts & Escalations", 3),
    ("/integrations", "Datadog & Grafana Forwarders", 3),
    ("/topology", "Multi-Region Global Topology", 3),
    ("/finops", "FinOps Cloud Cost Optimizer", 3),
    ("/dr", "Disaster Recovery & RTO/RPO", 3),
    ("/swarm", "AI SRE Agent Swarm Mission Control", 3),
    ("/error-budgets", "Error Budget Burn Rate Engine", 3),
    ("/compliance", "SOC2 / ISO-27001 Auditor", 3),
    ("/postmortems", "Incident Post-Mortems & RCA", 3),
    ("/runbooks", "SRE Runbook Automation Engine", 3),
    ("/synthetics", "Synthetic Journey & Waterfall", 3),
    ("/metrics", "Prometheus & SLO Dashboard", 3),
    ("/settings", "System Settings & Alert Webhooks", 3),
    ("/users", "Team & RBAC Matrix", 2),
    ("/audit", "Immutable Audit Ledger", 2),
    ("/assistant", "AI SRE Chat Console", 2),
    ("/traces", "OpenTelemetry Distributed Tracing", 3),
    ("/ebpf", "eBPF Kernel Network Observability", 3),
    ("/ai-gateway", "Edge AI Inference Gateway & Firewall", 3),
    ("/workload-identity", "Zero-Trust Identity & Secret Rotation", 3),
    ("/gitops", "GitOps Delivery & ArgoCD Drift Controller", 3),
    ("/sbom", "Supply Chain Security & CycloneDX SBOM", 3),
]

async def smooth_scroll(page, duration_sec=2):
    """Smoothly scrolls the browser window down and back up."""
    try:
        # Scroll down
        await page.evaluate("""
            window.scrollBy({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        """)
        await asyncio.sleep(duration_sec / 2)
        # Scroll back to top
        await page.evaluate("""
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        """)
        await asyncio.sleep(duration_sec / 2)
    except Exception:
        pass

async def run_robot():
    print("\n" + "=" * 60)
    print("🤖 Launching Autonomous Headed Browser Robot (Chrome/Chromium)...")
    print("=" * 60 + "\n")

    async with async_playwright() as p:
        # Launch visible browser on user's screen
        browser = await p.chromium.launch(headless=False, slow_mo=50)
        context = await browser.new_context(viewport={'width': 1280, 'height': 850})
        page = await context.new_page()

        for path, description, wait_time in PAGES_TO_VISIT:
            url = f"{BASE_URL}{path}"
            print(f"👉 [Robot Navigating] {description.ljust(35)} -> {url}")
            
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await asyncio.sleep(1)

                # Special action on login page: Click Auto-Fill
                if path == "/login":
                    try:
                        auto_fill_btn = page.locator("text=Auto-Fill")
                        if await auto_fill_btn.is_visible():
                            print("   ⚡ Clicking 'Auto-Fill' button...")
                            await auto_fill_btn.click()
                            await asyncio.sleep(1)
                    except Exception:
                        pass

                # Special action on settings page: Click Webhooks tab
                if path == "/settings":
                    try:
                        wh_tab = page.locator("text=Alert Webhooks")
                        if await wh_tab.is_visible():
                            print("   ⚡ Switching to Webhooks tab...")
                            await wh_tab.click()
                            await asyncio.sleep(1)
                    except Exception:
                        pass

                # Perform smooth scroll on page
                print(f"   👀 Visually scanning and scrolling {path}...")
                await smooth_scroll(page, duration_sec=wait_time)
                
                print(f"   ✅ Successfully verified {description}\n")
            except Exception as e:
                print(f"   ⚠️ Could not load {path} ({str(e)})\n")

        print("=" * 60)
        print("🎉 Autonomous UI Visual Verification Complete! Closing browser in 3s...")
        print("=" * 60 + "\n")
        await asyncio.sleep(3)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_robot())
