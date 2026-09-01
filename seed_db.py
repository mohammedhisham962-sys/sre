import os
import sys

# Add the backend dir to sys path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "backend")))

from app.database import SessionLocal, engine, Base
from app.models.project import Project
from app.models.monitor import Monitor

def seed_real_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if project exists
    project = db.query(Project).filter_by(name="Render Primary Server").first()
    if not project:
        project = Project(
            name="Render Primary Server", 
            description="The AIGRA Ops platform itself", 
            environment="production"
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        print("Created Project!")
        
    # Check if monitor exists
    monitor = db.query(Monitor).filter_by(project_id=project.id, name="Self Health Check").first()
    if not monitor:
        monitor = Monitor(
            project_id=project.id,
            name="Self Health Check",
            url="https://sre-4vhw.onrender.com/api/v1/health",
            monitor_type="HTTP",
            interval_seconds=60,
            is_active=True
        )
        db.add(monitor)
        db.commit()
        print("Created Healthy Monitor!")

    # Check if failing monitor exists
    failing_monitor = db.query(Monitor).filter_by(project_id=project.id, name="Deliberate Failure Test").first()
    if not failing_monitor:
        failing_monitor = Monitor(
            project_id=project.id,
            name="Deliberate Failure Test",
            url="http://httpstat.us/503", # This URL always returns 503 Service Unavailable
            monitor_type="HTTP",
            interval_seconds=60,
            is_active=True
        )
        db.add(failing_monitor)
        db.commit()
        print("Created Failing Monitor for Incident Testing!")

if __name__ == "__main__":
    seed_real_data()
