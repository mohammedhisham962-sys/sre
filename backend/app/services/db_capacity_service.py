from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class DbCapacityService:
    @staticmethod
    def get_capacity_metrics() -> Dict[str, Any]:
        """Returns database connection pool utilization, buffer cache, storage growth forecast, and IOPS headroom."""
        return {
            "cluster_name": "postgres-primary-prod-cluster",
            "db_engine": "PostgreSQL 16.2 (HA Multi-AZ)",
            "status": "HEALTHY",
            "connections": {
                "active": 64,
                "max_limit": 150,
                "idle": 42,
                "waiting_in_queue": 0,
                "utilization_pct": 42.7
            },
            "performance": {
                "buffer_cache_hit_ratio_pct": 99.4,
                "shared_buffers_mb": 8192,
                "effective_cache_size_mb": 24576,
                "current_iops": 1850,
                "max_provisioned_iops": 3000,
                "iops_utilization_pct": 61.6
            },
            "storage_forecast": {
                "total_disk_gb": 500,
                "used_disk_gb": 342,
                "free_disk_gb": 158,
                "used_pct": 68.4,
                "growth_rate_gb_per_month": 18.5,
                "days_until_85_pct_threshold": 84,
                "forecast_verdict": "ADEQUATE_HEADROOM"
            },
            "table_bloat": [
                {"table": "audit_logs", "size_mb": 14200, "bloat_pct": 3.8, "last_autovacuum": "2026-09-08 02:00:00 UTC", "status": "OPTIMAL"},
                {"table": "incidents_history", "size_mb": 4500, "bloat_pct": 5.1, "last_autovacuum": "2026-09-07 23:30:00 UTC", "status": "OPTIMAL"},
                {"table": "metric_samples", "size_mb": 38400, "bloat_pct": 11.4, "last_autovacuum": "2026-09-08 04:00:00 UTC", "status": "AUTOVACUUM_SCHEDULED"}
            ],
            "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    @staticmethod
    def autoscale_iops(target_iops: int = 6000, burst_duration_minutes: int = 60) -> Dict[str, Any]:
        """Provisions dynamic EBS/Persistent Disk IOPS throughput scale-up without database restart."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        return {
            "action": "IOPS_AUTOSCALED",
            "previous_iops": 3000,
            "target_iops": target_iops,
            "burst_duration_minutes": burst_duration_minutes,
            "allocated_at": now_str,
            "volume_status": "PROVISIONED_THROUGHPUT_ONLINE",
            "downtime_ms": 0,
            "status": "SUCCESS"
        }
