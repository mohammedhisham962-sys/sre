from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .database import engine, Base
from .api import auth_router, projects_router, monitoring_router, incidents_router, ai_router
from .api.deployments import router as deployments_router
from .api.policies import router as policies_router
from .api.admin import router as admin_router
from .api.health import router as health_router
from .api.users import router as users_router
from .api.ws import router as ws_router
from .api.repairs import router as repairs_router
from .api.system import router as system_router
from .api.assistant import router as assistant_router
from .api.audit import router as audit_router
from .api.security import router as security_router
from .api.approvals import router as approvals_router
from .api.analysis import router as analysis_router
from .api.metrics import router as metrics_router
from .api.webhooks import router as webhooks_router
from .api.backup import router as backup_router
from .api.status import router as status_router
from .api.chaos import router as chaos_router
from .api.k8s import router as k8s_router
from .api.integrations import router as integrations_router
from .api.oncall import router as oncall_router
from .api.canary import router as canary_router
from .api.runbooks import router as runbooks_router
from .api.synthetics import router as synthetics_router
from .api.topology import router as topology_router
from .api.finops import router as finops_router
from .api.dr import router as dr_router
from .api.swarm import router as swarm_router
from .api.burn_rate import router as burn_rate_router
from .api.compliance import router as compliance_router
from .api.traces import router as traces_router
from .api.ebpf import router as ebpf_router
from .api.ai_gateway import router as ai_gateway_router
from .api.workload_identity import router as workload_identity_router
from .api.gitops import router as gitops_router
from .api.sbom import router as sbom_router
from .api.edge_waf import router as edge_waf_router
from .api.db_capacity import router as db_capacity_router
from .api.feature_flags import router as feature_flags_router
from .api.policies import router as policies_router

from .logger import logger
from .errors import global_exception_handler

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIGRA Ops API", version="1.0.0")

# Register global exception handler
app.add_exception_handler(Exception, global_exception_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(health_router, prefix="/api/v1/health", tags=["health"])
app.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
app.include_router(ws_router, prefix="/ws", tags=["realtime"])

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(users_router, prefix="/users", tags=["users"])
api_v1_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_v1_router.include_router(monitoring_router, prefix="/monitoring", tags=["monitoring"])
api_v1_router.include_router(incidents_router, prefix="/incidents", tags=["incidents"])
api_v1_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_v1_router.include_router(deployments_router, prefix="/deployments", tags=["deployments"])
api_v1_router.include_router(policies_router, prefix="/policies", tags=["policies"])
api_v1_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_v1_router.include_router(repairs_router, prefix="/repairs", tags=["repairs"])
api_v1_router.include_router(system_router, prefix="/system", tags=["system"])
api_v1_router.include_router(assistant_router, prefix="/assistant", tags=["assistant"])
api_v1_router.include_router(audit_router, prefix="/audit", tags=["audit"])
api_v1_router.include_router(security_router, prefix="/security", tags=["security"])
api_v1_router.include_router(approvals_router, prefix="/approvals", tags=["approvals"])
api_v1_router.include_router(analysis_router, prefix="/analysis", tags=["analysis"])
api_v1_router.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
api_v1_router.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])
api_v1_router.include_router(backup_router, prefix="/backup", tags=["backup"])
api_v1_router.include_router(status_router, prefix="/status", tags=["status"])
api_v1_router.include_router(chaos_router, prefix="/chaos", tags=["chaos"])
api_v1_router.include_router(k8s_router, prefix="/k8s", tags=["kubernetes"])
api_v1_router.include_router(integrations_router, prefix="/integrations", tags=["integrations"])
api_v1_router.include_router(oncall_router, prefix="/oncall", tags=["oncall"])
api_v1_router.include_router(canary_router, prefix="/canary", tags=["canary"])
api_v1_router.include_router(runbooks_router, prefix="/runbooks", tags=["runbooks"])
api_v1_router.include_router(synthetics_router, prefix="/synthetics", tags=["synthetics"])
api_v1_router.include_router(topology_router, prefix="/topology", tags=["topology"])
api_v1_router.include_router(finops_router, prefix="/finops", tags=["finops"])
api_v1_router.include_router(dr_router, prefix="/dr", tags=["disaster_recovery"])
api_v1_router.include_router(swarm_router, prefix="/swarm", tags=["swarm"])
api_v1_router.include_router(burn_rate_router, prefix="/error-budgets", tags=["error_budgets"])
api_v1_router.include_router(compliance_router, prefix="/compliance", tags=["compliance"])
api_v1_router.include_router(traces_router, prefix="/traces", tags=["tracing"])
api_v1_router.include_router(ebpf_router, prefix="/ebpf", tags=["ebpf"])
api_v1_router.include_router(ai_gateway_router, prefix="/ai-gateway", tags=["ai_gateway"])
api_v1_router.include_router(workload_identity_router, prefix="/workload-identity", tags=["workload_identity"])
api_v1_router.include_router(gitops_router, prefix="/gitops", tags=["gitops"])
api_v1_router.include_router(sbom_router, prefix="/sbom", tags=["sbom"])
api_v1_router.include_router(edge_waf_router, prefix="/edge-waf", tags=["edge_waf"])
api_v1_router.include_router(db_capacity_router, prefix="/db-capacity", tags=["db_capacity"])
api_v1_router.include_router(feature_flags_router, prefix="/feature-flags", tags=["feature_flags"])

# Phase 8: Reliability & Traffic Management
app.include_router(edge_waf_router, prefix="/api/v1/edge-waf", tags=["Edge WAF"])
app.include_router(db_capacity_router, prefix="/api/v1/db-capacity", tags=["DB Capacity"])
app.include_router(feature_flags_router, prefix="/api/v1/feature-flags", tags=["Feature Flags"])

# Phase 9: FinOps, AIOps & Shift-Left Policies
app.include_router(finops_router, prefix="/api/v1/finops", tags=["FinOps"])
app.include_router(assistant_router, prefix="/api/v1/assistant", tags=["AIOps Assistant"])
app.include_router(policies_router, prefix="/api/v1/policies", tags=["DevSecOps Policies"])

app.include_router(api_v1_router, prefix="/api/v1")

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .services.monitor_worker import run_monitoring_cycle

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    logger.info("AIGRA Ops API started.")
    # Start the monitoring background worker
    scheduler.add_job(run_monitoring_cycle, "interval", seconds=60)
    scheduler.start()
    logger.info("Monitoring scheduler started.")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    logger.info("Monitoring scheduler stopped.")

# Serve Frontend Static Files (Unified Hosting)
frontend_path = os.path.join(os.getcwd(), "frontend_build")
if os.path.isdir(frontend_path):
    @app.get("/{full_path:path}")
    async def serve_spa_or_static(full_path: str):
        # Allow API and websocket routes to pass through
        if full_path.startswith("api/") or full_path.startswith("ws/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        # 1. Exact file match (e.g. _next/static/...)
        file_path = os.path.join(frontend_path, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)

        # 2. Directory with index.html (e.g. status -> status/index.html)
        dir_index = os.path.join(frontend_path, full_path, "index.html")
        if os.path.isfile(dir_index):
            return FileResponse(dir_index)

        # 3. HTML file match (e.g. status -> status.html)
        html_file = os.path.join(frontend_path, f"{full_path}.html")
        if os.path.isfile(html_file):
            return FileResponse(html_file)

        # 4. Fallback to root index.html
        root_index = os.path.join(frontend_path, "index.html")
        if os.path.isfile(root_index):
            return FileResponse(root_index)

        raise HTTPException(status_code=404, detail="Page not found")
else:
    @app.get("/")
    def fallback_root():
        return {"message": "AIGRA Ops API is running, but frontend static files were not found."}
