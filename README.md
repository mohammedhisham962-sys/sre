# 🚀 AIGRA Ops Platform

An enterprise-grade Site Reliability Engineering (SRE) and Infrastructure Operations platform built with a high-performance **FastAPI** backend and a static-exported **Next.js 13+** App Router frontend.

## 🌟 The Ultimate SRE Control Plane

AIGRA Ops consolidates 24+ critical observability, reliability, and security subsystems into a single unified control plane.

### 🛡️ Core Capabilities Built
*   **Traffic & Network**: Global Layer 7 routing, BGP peering topology maps.
*   **Compute & Capacity**: Predictive DB IOPS auto-scaler, EC2/EKS capacity planners.
*   **Observability**: Centralized logs, Prometheus metrics, OpenTelemetry distributed tracing.
*   **Kernel Diagnostics**: eBPF kernel socket monitoring & TCP retransmits.
*   **Reliability Engineering**: Alerting engine, SLO error-budgets, automated runbooks, Chaos engineering.
*   **DevSecOps Shift-Left**: OPA Gatekeeper IaC policies, CycloneDX SBOM generation, SLSA L3 attestations.
*   **Zero-Trust Identity**: Multi-cloud federated OIDC workload identities & secret rotation.
*   **GitOps Progressive Delivery**: ArgoCD drift controller with multi-wave ring rollouts.
*   **Edge Security**: Global CDN caching, automated OWASP Top 10 dynamic WAF blocking.
*   **FinOps & AIOps**: Automated idle resource culling, cloud cost tracking, and an LLM-powered incident root-cause assistant.

---

## 🏗️ Architecture & Tech Stack

AIGRA Ops is designed to be easily deployed as a single, self-contained unified artifact.

-   **Backend**: Python 3.11, FastAPI, Pydantic, SQLAlchemy, Pytest.
-   **Frontend**: React, Next.js 13+ (App Router, Static Export), Tailwind CSS.
-   **Unified Hosting**: The FastAPI backend intercepts unknown routes and statically serves the Next.js `out/` directory, eliminating the need for a separate Node.js frontend server in production.

---

## 🐳 Quickstart (Docker Compose)

The easiest way to run the entire platform locally is using Docker.

```bash
# 1. Clone the repository
git clone https://github.com/mohammedhisham962-sys/sre.git
cd sre

# 2. Build and launch the multi-stage Docker container
docker-compose up -d --build

# 3. Access the platform
# Open http://localhost:8000 in your browser.
```

---

## 💻 Local Development

If you wish to develop on the backend and frontend separately:

### 1. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Docs available at: `http://localhost:8000/docs`*

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*UI available at: `http://localhost:3000`*

---

## ✅ Testing & CI/CD
This repository includes a robust suite of `pytest` integration tests covering every subsystem.
A GitHub Actions workflow automatically runs these tests and builds the Next.js static export on every push.

To run tests locally:
```bash
export PYTHONPATH=backend  # Set python path
python -m pytest backend/tests/ -v
```
