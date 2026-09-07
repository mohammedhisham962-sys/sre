from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.k8s import K8sCluster, K8sHealingAction
from ..services.k8s_healer import k8s_healer

router = APIRouter()

class PodHealRequest(BaseModel):
    deployment_name: str
    namespace: Optional[str] = "default"
    issue_type: str # OOMKilled, CrashLoopBackOff, ImagePullBackOff
    current_memory: Optional[str] = "256Mi"

class PodHealResponse(BaseModel):
    status: str
    deployment: str
    namespace: str
    issue_type: str
    action_taken: str
    patch_yaml: str

@router.get("/pods")
def list_monitored_pods():
    """
    Returns simulated/real Kubernetes cluster pod health status.
    """
    return [
        {
            "name": "checkout-service-7f8d9b-x2k4",
            "deployment": "checkout-service",
            "namespace": "production",
            "status": "Running",
            "restarts": 0,
            "cpu_usage": "140m",
            "memory_usage": "310Mi",
            "healthy": True
        },
        {
            "name": "payment-worker-6c5a1e-89zf",
            "deployment": "payment-worker",
            "namespace": "production",
            "status": "OOMKilled",
            "restarts": 4,
            "cpu_usage": "850m",
            "memory_usage": "1024Mi",
            "healthy": False,
            "recommended_heal": "Scale memory to 2Gi"
        },
        {
            "name": "auth-gateway-4b8c9d-1m7q",
            "deployment": "auth-gateway",
            "namespace": "production",
            "status": "CrashLoopBackOff",
            "restarts": 12,
            "cpu_usage": "10m",
            "memory_usage": "45Mi",
            "healthy": False,
            "recommended_heal": "Inject adjusted liveness probe"
        }
    ]

@router.post("/heal", response_model=PodHealResponse)
def heal_pod(req: PodHealRequest, db: Session = Depends(get_db)):
    """
    Triggers autonomous healing for a failing Kubernetes pod.
    """
    result = k8s_healer.heal_pod(
        deployment_name=req.deployment_name,
        namespace=req.namespace,
        issue_type=req.issue_type,
        db=db
    )

    action = K8sHealingAction(
        pod_name=f"{req.deployment_name}-pod",
        namespace=req.namespace,
        issue_type=req.issue_type,
        action_taken=result["action_taken"],
        patch_yaml=result["patch_yaml"],
        status="HEALED"
    )
    db.add(action)
    db.commit()

    return result

@router.get("/history")
def get_healing_history(db: Session = Depends(get_db)):
    """
    Returns the historical ledger of all Kubernetes auto-healing actions.
    """
    actions = db.query(K8sHealingAction).order_by(K8sHealingAction.id.desc()).limit(50).all()
    return [
        {
            "id": a.id,
            "pod_name": a.pod_name,
            "namespace": a.namespace,
            "issue_type": a.issue_type,
            "action_taken": a.action_taken,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in actions
    ]
