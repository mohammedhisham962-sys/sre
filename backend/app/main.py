from fastapi import FastAPI, APIRouter
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

app.include_router(api_v1_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    logger.info("AIGRA Ops API started.")

# Serve Frontend Static Files (Unified Hosting)
# Make sure this is at the VERY END of the file so it doesn't override API routes!
frontend_path = os.path.join(os.getcwd(), "frontend_build")
if os.path.isdir(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    @app.get("/")
    def fallback_root():
        return {"message": "AIGRA Ops API is running, but frontend static files were not found."}
