import pytest
from app.services.edge_waf_service import EdgeWafService
from app.services.db_capacity_service import DbCapacityService
from app.services.feature_flags_service import FeatureFlagsService

def test_edge_waf_status_and_actions():
    status = EdgeWafService.get_status()
    assert status["status"] == "HEALTHY"
    assert status["cache_hit_ratio_pct"] > 90.0
    assert len(status["pops"]) == 5
    assert len(status["waf_rules"]) == 4
    
    # Test cache purge
    purge = EdgeWafService.purge_cache(scope="global")
    assert purge["status"] == "SUCCESS"
    assert purge["purged_pops_count"] == 5
    
    # Test IP block
    block = EdgeWafService.block_ip("198.51.100.99", "Automated SQLi attempt", duration_hours=24)
    assert block["status"] == "SUCCESS"
    assert block["sync_status"] == "PROPAGATED_GLOBALLY"

def test_db_capacity_metrics_and_autoscaling():
    metrics = DbCapacityService.get_capacity_metrics()
    assert metrics["status"] == "HEALTHY"
    assert metrics["connections"]["max_limit"] == 150
    assert metrics["performance"]["buffer_cache_hit_ratio_pct"] > 99.0
    assert metrics["storage_forecast"]["days_until_85_pct_threshold"] > 0
    assert len(metrics["table_bloat"]) >= 3
    
    # Test IOPS autoscaling
    scale = DbCapacityService.autoscale_iops(target_iops=6000, burst_duration_minutes=60)
    assert scale["status"] == "SUCCESS"
    assert scale["target_iops"] == 6000
    assert scale["downtime_ms"] == 0

def test_feature_flags_and_kill_switch():
    flags_data = FeatureFlagsService.get_flags()
    assert flags_data["total_flags"] == 4
    assert flags_data["active_flags"] >= 3
    
    # Test toggle flag
    toggle = FeatureFlagsService.toggle_flag("FLAG_TURBO_GRAPHQL_GATEWAY", enabled=True, ring="Ring 1 (Beta)", rollout_pct=10)
    assert toggle["status"] == "SUCCESS"
    assert toggle["enabled"] is True
    
    # Test emergency kill-switch
    kill = FeatureFlagsService.trigger_kill_switch("FLAG_TURBO_GRAPHQL_GATEWAY", reason="Error rate > 1%")
    assert kill["status"] == "EMERGENCY_DEACTIVATION_COMPLETE"
    assert kill["enabled"] is False
    assert kill["kill_switch_engaged"] is True
