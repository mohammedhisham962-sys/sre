import pytest
from app.services.incident_engine import incident_engine
from app.database import SessionLocal
from app.models.project import Project
from app.models.monitor import Monitor, MonitoringResult

@pytest.mark.asyncio
async def test_false_positive_prevention_logic():
    # If confirm_failure is invoked against a working URL, it returns is_up=True
    result = await incident_engine.confirm_failure(monitor_id=999, url="https://httpbin.org/status/200")
    assert result["is_up"] is True
    assert result["status_code"] == 200

@pytest.mark.asyncio
async def test_confirmed_failure_detection():
    # If confirm_failure is invoked against a 503 URL, it returns is_up=False
    result = await incident_engine.confirm_failure(monitor_id=999, url="https://httpstat.us/503")
    assert result["is_up"] is False
