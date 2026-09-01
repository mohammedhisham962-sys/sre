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
    monitor = db.query(Monitor).filter_by(project_id=project.id).first()
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
        print("Created Monitor!")

if __name__ == "__main__":
    seed_real_data()
