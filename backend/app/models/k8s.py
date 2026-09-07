from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class K8sCluster(Base):
    __tablename__ = "k8s_clusters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    api_server_url = Column(String)
    environment = Column(String, default="production")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    healing_actions = relationship("K8sHealingAction", back_populates="cluster", cascade="all, delete-orphan")

class K8sHealingAction(Base):
    __tablename__ = "k8s_healing_actions"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, ForeignKey("k8s_clusters.id"), nullable=True)
    pod_name = Column(String, index=True)
    namespace = Column(String, default="default")
    issue_type = Column(String) # OOMKilled, CrashLoopBackOff, ImagePullBackOff, HighMemory
    action_taken = Column(String) # RESOURCE_PATCH, RESTART_DEPLOYMENT, ROLLBACK
    patch_yaml = Column(Text, nullable=True)
    status = Column(String, default="HEALED") # HEALED, IN_PROGRESS, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    cluster = relationship("K8sCluster", back_populates="healing_actions")
