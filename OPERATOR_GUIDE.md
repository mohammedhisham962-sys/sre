# 📖 AIGRA Ops Platform — Operator Handbook & Reference Guide

Welcome to the **AIGRA Ops Platform Operator Handbook**. This manual serves as the primary technical reference for site reliability engineers, DevOps teams, and system administrators managing the platform.

---

## 🏗️ 1. Architecture Overview

AIGRA Ops is an autonomous SRE and self-healing platform composed of 4 core layers:

```
┌──────────────────────────────────────────────────────────────┐
│                  Next.js 16 UI (Frontend)                    │
│    (Live Monitors, Incidents, AI Repair, Chaos, Metrics)     │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTP / WebSocket
┌──────────────────────────────▼───────────────────────────────┐
│               FastAPI Autonomous SRE Engine                  │
│  ├─ Background APScheduler (60s Health Probe Worker)         │
│  ├─ Double-Confirmation False-Positive Engine                │
│  ├─ Groq Cloud LLaMA-3 AI Repair & Post-Mortem Generator     │
│  ├─ Defensive Security Regex Secret Scanner                  │
│  ├─ Multi-Channel Webhook Dispatcher (Slack / Discord)       │
│  └─ Prometheus Standard Metrics Exporter (/metrics)          │
└──────────────────────┬───────────────────────────────┬───────┘
                       │                               │
        ┌──────────────▼─────────────┐   ┌─────────────▼──────┐
        │   PostgreSQL 15 Database   │   │  GitHub REST API   │
        │ (Projects, Incidents, Logs)│   │(Branch, Patch, PRs)│
        └────────────────────────────┘   └────────────────────┘
```

---

## ⚙️ 2. Environment Configuration Reference (`.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL or SQLite database connection string | `postgresql://user:pass@host:5432/aigraops` |
| `SECRET_KEY` | Cryptographic secret for signing JWT auth tokens | `supersecretkeyforproduction2026` |
| `ENVIRONMENT` | Runtime mode (`production` or `development`) | `production` |
| `GROQ_API_KEY` | Groq Cloud API key for LLaMA-3 code repair & triage | `gsk_...` (Free at console.groq.com) |
| `GITHUB_TOKEN` | GitHub Personal Access Token (PAT with `repo` scope) | `ghp_...` |
| `PORT` | Web server listening port | `8000` (Render: `10000`) |

---

## 🚀 3. Quick Start & Operational CLI Commands

### Run Multi-Container Stack (Docker Compose)
```bash
# Launch PostgreSQL, FastAPI, Next.js, and Prometheus
docker-compose up --build -d

# View live service logs
docker-compose logs -f backend
```

### Run Master Operational Suites
```bash
# 1. Comprehensive Platform Verification (Chaos, Webhooks, Projects, Docker)
python scripts/run_all_operations.py

# 2. Advanced SRE Suite (Forensics, LoadGen, Snapshots, Visual Robot)
python scripts/run_advanced_suite.py

# 3. Headed Autonomous Browser Robot (Visual Screen Testing)
python scripts/e2e_ui_robot.py

# 4. Continuous Background Telemetry Daemon
python scripts/telemetry_daemon.py
```

---

## 📡 4. REST API Endpoint Directory

| Endpoint | Method | Description |
|---|---|---|
| `/health` or `/api/v1/health` | `GET` | Instant health check (DB connectivity & status) |
| `/api/v1/system/health` | `GET` | Detailed telemetry (DB latency, GitHub PAT, Groq status) |
| `/api/v1/projects/` | `GET` / `POST` | Manage monitored services and repositories |
| `/api/v1/incidents/` | `GET` | Query active and resolved incident feeds |
| `/api/v1/repairs/{id}/execute` | `POST` | Trigger autonomous AI repair pipeline on incident |
| `/api/v1/metrics/slo` | `GET` | SLO compliance, error budget, and latency percentiles |
| `/api/v1/status/public` | `GET` | Customer-facing status page with 30-check uptime history |
| `/api/v1/chaos/faults` | `POST` | Inject chaos latency spikes or 500 error faults |
| `/api/v1/backup/export` | `GET` | Download full cryptographic JSON database snapshot |
| `/metrics` | `GET` | Standard Prometheus scrapable plain-text metrics |
| `/docs` | `GET` | Interactive OpenAPI Swagger UI documentation |

---

## 🚨 5. Incident Escalation & Self-Healing Runbook

When downtime is detected:
1. **Detection**: The background worker polls the target endpoint every 60s.
2. **Double Confirmation**: If a failure occurs, an immediate secondary confirmation check is run to rule out transient blips.
3. **Escalation**: An `Incident` record is created with `CRITICAL` severity and dispatched to Slack/Discord webhooks.
4. **Autonomous AI Repair**:
   - Clones target repository into `/tmp/aigra_workspaces/`.
   - LLaMA-3 analyzes code and synthesizes a unified diff patch.
   - **Defensive Security Scanner** validates zero leaked API keys or credentials.
   - Applies patch, creates branch `aigra-repair-inc-<id>`, and opens a Pull Request on GitHub.
5. **Human Gateway**: SRE reviews diff in `/approvals` or on GitHub before merging to trigger CI/CD deploy.

---

## 🛡️ 6. Disaster Recovery & Snapshot Restore

### Export Snapshot
Navigate to [`/settings`](https://sre-4vhw.onrender.com/settings) → **Database Snapshot** → Click **Download Database Snapshot**, or execute:
```bash
curl -s https://sre-4vhw.onrender.com/api/v1/backup/export > backup.json
```

### Validate Snapshot Integrity
```python
import hashlib, json
with open("backup.json", "rb") as f:
    print("SHA-256:", hashlib.sha256(f.read()).hexdigest())
```
