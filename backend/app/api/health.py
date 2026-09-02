from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db

router = APIRouter()

@router.get("")
@router.get("/")
def health_check(db: Session = Depends(get_db)):
    """
    Validates backend availability and database connection.
    """
    health_status = {
        "status": "ok",
        "backend": "ok",
        "database": "unknown"
    }

    try:
        db.execute(text("SELECT 1"))
        health_status["database"] = "ok"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    return health_status
