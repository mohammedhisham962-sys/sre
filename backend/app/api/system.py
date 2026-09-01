from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import time
import os

from ..database import get_db, engine
from ..config import settings
from ..services.github_client import github_client
from ..services.ai_provider import ai_provider

router = APIRouter()

@router.get("/health")
async def get_system_diagnostics(db: Session = Depends(get_db)):
    """
    Returns live system diagnostics for Database, GitHub API, AI Engine, and Scheduler.
    """
    # 1. Database Diagnostic
    db_start = time.time()
    db_healthy = False
    db_error = None
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception as e:
        db_error = str(e)
    db_latency_ms = int((time.time() - db_start) * 1000)
    
    db_dialect = engine.dialect.name
    is_postgres = "postgres" in db_dialect or "postgresql" in settings.DATABASE_URL
    
    # 2. GitHub API Diagnostic
    gh_configured = github_client.has_token()
    gh_status = "Connected" if gh_configured else "Token Not Set (Mock Mode)"
    
    # 3. AI Provider Diagnostic
    ai_configured = bool(ai_provider.api_key)
    ai_status = "Online (Groq LLaMA-3)" if ai_configured else "Standby (Zero-Cost Mock Mode)"
    
    # 4. Background Scheduler
    # Scheduler is defined in main.py, check if running
    from ..main import scheduler
    scheduler_running = scheduler.running if hasattr(scheduler, "running") else False
    job_count = len(scheduler.get_jobs()) if scheduler_running else 0

    return {
        "status": "operational" if db_healthy else "degraded",
        "timestamp": time.time(),
        "database": {
            "healthy": db_healthy,
            "engine": "PostgreSQL (Production)" if is_postgres else "SQLite (Local Fallback)",
            "dialect": db_dialect,
            "latency_ms": db_latency_ms,
            "error": db_error
        },
        "github": {
            "configured": gh_configured,
            "status": gh_status,
            "auth_type": "Personal Access Token (PAT)" if gh_configured else "None"
        },
        "ai_engine": {
            "configured": ai_configured,
            "provider": "Groq Cloud (Free Tier)",
            "model": ai_provider.model,
            "status": ai_status
        },
        "scheduler": {
            "running": scheduler_running,
            "interval_seconds": 60,
            "active_jobs": job_count,
            "status": "Active (HTTP Worker Pinging Every 60s)" if scheduler_running else "Stopped"
        }
    }
