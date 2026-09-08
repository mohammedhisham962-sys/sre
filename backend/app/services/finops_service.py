import random
from datetime import datetime, timedelta

class FinOpsService:
    def __init__(self):
        self.daily_budget = 5000.00
        self.current_spend = 4250.00
        self.projected_spend = 5800.00
        self.idle_resources = [
            {"id": "disk-1a2b3c", "type": "EBS Volume", "region": "us-east-1", "idle_days": 45, "monthly_cost": 120.00, "status": "Idle"},
            {"id": "i-09ab87cd", "type": "EC2 Instance", "region": "us-west-2", "idle_days": 14, "monthly_cost": 340.00, "status": "Idle"},
            {"id": "eip-55.x.x.x", "type": "Elastic IP", "region": "eu-central-1", "idle_days": 90, "monthly_cost": 3.60, "status": "Idle"}
        ]
        self.anomalies = [
            {"service": "BigQuery", "spike_percent": 340, "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "root_cause": "Unoptimized Cartesian Join in Marketing Pipeline"},
            {"service": "Cloud NAT", "spike_percent": 150, "timestamp": (datetime.now() - timedelta(days=1)).isoformat(), "root_cause": "Data exfiltration via legacy API"}
        ]

    def get_finops_status(self):
        return {
            "summary": {
                "daily_budget": self.daily_budget,
                "current_spend": self.current_spend,
                "projected_spend": self.projected_spend,
                "status": "OVER_BUDGET" if self.projected_spend > self.daily_budget else "HEALTHY",
                "total_savings_opportunity": sum(r["monthly_cost"] for r in self.idle_resources if r["status"] == "Idle")
            },
            "anomalies": self.anomalies,
            "idle_resources": self.idle_resources
        }

    def cull_idle_resource(self, resource_id: str):
        for resource in self.idle_resources:
            if resource["id"] == resource_id:
                if resource["status"] == "Terminated":
                    return {"status": "error", "message": "Resource already terminated"}
                resource["status"] = "Terminated"
                return {"status": "success", "message": f"Resource {resource_id} successfully terminated", "savings": resource["monthly_cost"]}
        return {"status": "error", "message": "Resource not found"}

finops_service = FinOpsService()
