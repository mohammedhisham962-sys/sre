import asyncio
import httpx
from datetime import datetime, timezone
import time
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.monitor import Monitor, MonitoringResult
from .incident_engine import incident_engine
from ..logger import logger

async def ping_target(monitor_id: int, url: str):
    async with httpx.AsyncClient() as client:
        try:
            start_time = time.time()
            # 10s timeout so we don't hang forever
            response = await client.get(url, timeout=10.0)
            latency_ms = int((time.time() - start_time) * 1000)
            
            return {
                "monitor_id": monitor_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "is_up": response.status_code < 400,
                "error_message": None
            }
        except Exception as e:
            return {
                "monitor_id": monitor_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status_code": None,
                "latency_ms": None,
                "is_up": False,
                "error_message": str(e)
            }

async def run_monitoring_cycle():
    """Fetches all active monitors, pings them concurrently, and saves results."""
    db: Session = SessionLocal()
    try:
        monitors = db.query(Monitor).filter(Monitor.is_active == True).all()
        if not monitors:
            return

        tasks = []
        for monitor in monitors:
            tasks.append(ping_target(monitor.id, monitor.url))
            
        results = await asyncio.gather(*tasks)
        
        for res_dict in results:
            result_record = MonitoringResult(**res_dict)
            db.add(result_record)
            
            # Pass to incident engine for evaluation (False Positive Protection)
            await incident_engine.handle_monitoring_result(db, result_record)
            
        db.commit()
        logger.info(f"Recorded monitoring results for {len(results)} targets.")
        
    except Exception as e:
        logger.error(f"Error in monitoring cycle: {e}")
        db.rollback()
    finally:
        db.close()
