"""
Multi-Region Global Topology & Traffic Failover Service for AIGRA Ops.
Manages distributed cloud regions, tracks cross-region replication lag,
and executes real-time DNS traffic re-routing during regional outages.
"""

from datetime import datetime
from typing import Dict, Any, List
import copy

GLOBAL_REGIONS = [
    {
        "id": "us-east-1",
        "name": "US East (N. Virginia)",
        "role": "PRIMARY_INGRESS",
        "status": "HEALTHY",
        "latency_ms": 24,
        "traffic_pct": 45,
        "replication_lag_ms": 0,
        "nodes_count": 24,
        "active_connections": 18450,
        "coordinates": {"lat": 39.0438, "lng": -77.4874}
    },
    {
        "id": "eu-west-1",
        "name": "Europe West (Ireland)",
        "role": "SECONDARY_INGRESS",
        "status": "HEALTHY",
        "latency_ms": 48,
        "traffic_pct": 30,
        "replication_lag_ms": 12,
        "nodes_count": 16,
        "active_connections": 12300,
        "coordinates": {"lat": 53.3498, "lng": -6.2603}
    },
    {
        "id": "ap-southeast-1",
        "name": "Asia Pacific (Singapore)",
        "role": "EDGE_CLUSTER",
        "status": "HEALTHY",
        "latency_ms": 72,
        "traffic_pct": 18,
        "replication_lag_ms": 28,
        "nodes_count": 12,
        "active_connections": 7380,
        "coordinates": {"lat": 1.3521, "lng": 103.8198}
    },
    {
        "id": "sa-east-1",
        "name": "South America (São Paulo)",
        "role": "DR_STANDBY",
        "status": "STANDBY",
        "latency_ms": 110,
        "traffic_pct": 7,
        "replication_lag_ms": 45,
        "nodes_count": 8,
        "active_connections": 2870,
        "coordinates": {"lat": -23.5505, "lng": -46.6333}
    }
]


class TopologyService:
    """
    Simulates and manages multi-region global telemetry and traffic steering.
    """

    @staticmethod
    def get_topology() -> Dict[str, Any]:
        regions = copy.deepcopy(GLOBAL_REGIONS)
        total_traffic = sum(r["traffic_pct"] for r in regions)
        total_connections = sum(r["active_connections"] for r in regions)
        avg_replication_lag = sum(r["replication_lag_ms"] for r in regions) / len(regions)

        return {
            "global_status": "OPTIMAL",
            "active_regions_count": len(regions),
            "total_traffic_pct": total_traffic,
            "total_connections": total_connections,
            "avg_replication_lag_ms": round(avg_replication_lag, 1),
            "regions": regions,
            "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def execute_failover(drain_region_id: str, target_region_id: str = "eu-west-1") -> Dict[str, Any]:
        """
        Drains traffic from a degraded region and redistributes to healthy regions.
        """
        regions = copy.deepcopy(GLOBAL_REGIONS)
        drained = next((r for r in regions if r["id"] == drain_region_id), None)
        target = next((r for r in regions if r["id"] == target_region_id), None)

        if not drained:
            drained = regions[0]
        if not target or target["id"] == drained["id"]:
            target = next(r for r in regions if r["id"] != drained["id"])

        shifted_traffic = drained["traffic_pct"]
        drained["traffic_pct"] = 0
        drained["status"] = "DRAINED"
        drained["active_connections"] = 0

        target["traffic_pct"] += shifted_traffic
        target["active_connections"] += 15000
        target["status"] = "SURGE_ACTIVE"

        return {
            "action": "GLOBAL_DNS_FAILOVER",
            "status": "COMPLETED",
            "drained_region": drained["id"],
            "target_region": target["id"],
            "traffic_shifted_pct": shifted_traffic,
            "convergence_time_ms": 1420,
            "regions": regions,
            "executed_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
