from fastapi import Request
from fastapi.responses import JSONResponse
from .logger import logger
import traceback

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "unhandled_exception", 
        path=request.url.path, 
        method=request.method, 
        error=str(exc),
        traceback=traceback.format_exc()
    )
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected internal server error occurred. Please contact support."},
    )
