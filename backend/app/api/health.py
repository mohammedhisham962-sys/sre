from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
import httpx
from ..database import get_db
from ..config import settings
import redis

router = APIRouter()

@router.get("/")
def health_check(db: Session = Depends(get_db)):
    """
    Validates backend availability, database connection, and redis connection.
    """
    health_status = {
        "backend": "ok",
        "database": "unknown",
        "redis": "unknown"
    }

    # Check Database
    try:
        # Simple query to verify DB connection
        db.execute("SELECT 1")
        health_status["database"] = "ok"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        
    # Check Redis (Optional in local dev)
    try:
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        health_status["redis"] = "ok"
    except Exception as e:
        health_status["redis"] = "disabled_in_local"

    if health_status["database"] not in ["ok", "unknown"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )

    return health_status
