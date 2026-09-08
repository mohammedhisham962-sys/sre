"""
OpenTelemetry (OTel) Distributed Tracing Service for AIGRA Ops.
Manages distributed span waterfall trees, parent-child trace propagation,
and identifies P99 latency bottleneck queries across microservices.
"""

from datetime import datetime
from typing import Dict, Any, List
import copy

CANONICAL_TRACES = [
    {
        "trace_id": "trc-4982-checkout",
        "service": "checkout-api",
        "operation": "POST /api/v1/checkout",
        "total_duration_ms": 142,
        "status": "SUCCESS",
        "span_count": 6,
        "timestamp": "Today, 09:42:15 UTC",
        "bottleneck_detected": True,
        "bottleneck_span": "postgres.query.orders",
        "spans": [
            {
                "span_id": "spn-01",
                "parent_span_id": None,
                "service": "ingress-envoy-gateway",
                "name": "HTTP POST /api/v1/checkout",
                "start_offset_ms": 0,
                "duration_ms": 142,
                "status": "OK",
                "attributes": {"http.status_code": 200, "http.method": "POST", "net.peer.ip": "198.51.100.42"}
            },
            {
                "span_id": "spn-02",
                "parent_span_id": "spn-01",
                "service": "auth-service",
                "name": "JWT Token Verification & Scope Check",
                "start_offset_ms": 4,
                "duration_ms": 18,
                "status": "OK",
                "attributes": {"auth.strategy": "RS256", "user.role": "customer"}
            },
            {
                "span_id": "spn-03",
                "parent_span_id": "spn-01",
                "service": "cart-service",
                "name": "Cart Item & Inventory Lock",
                "start_offset_ms": 24,
                "duration_ms": 45,
                "status": "OK",
                "attributes": {"cart.items_count": 3, "inventory.lock_id": "lck-8821"}
            },
            {
                "span_id": "spn-04",
                "parent_span_id": "spn-03",
                "service": "postgres-cluster",
                "name": "postgres.query.orders (SELECT FOR UPDATE)",
                "start_offset_ms": 30,
                "duration_ms": 68,
                "status": "SLOW_QUERY",
                "attributes": {
                    "db.system": "postgresql",
                    "db.statement": "SELECT * FROM inventory_items WHERE sku IN ($1, $2, $3) FOR UPDATE;",
                    "db.rows_returned": 3
                }
            },
            {
                "span_id": "spn-05",
                "parent_span_id": "spn-01",
                "service": "payment-gateway",
                "name": "Stripe Webhook Dispatch & Charge Intent",
                "start_offset_ms": 98,
                "duration_ms": 38,
                "status": "OK",
                "attributes": {"payment.provider": "stripe", "payment.currency": "usd", "payment.amount": 89.50}
            },
            {
                "span_id": "spn-06",
                "parent_span_id": "spn-01",
                "service": "redis-cluster",
                "name": "redis.set (Order Cache Key)",
                "start_offset_ms": 138,
                "duration_ms": 4,
                "status": "OK",
                "attributes": {"db.system": "redis", "redis.key": "order:session:4982"}
            }
        ]
    },
    {
        "trace_id": "trc-8193-auth-login",
        "service": "auth-gateway",
        "operation": "POST /api/v1/auth/login",
        "total_duration_ms": 38,
        "status": "SUCCESS",
        "span_count": 3,
        "timestamp": "Today, 09:41:02 UTC",
        "bottleneck_detected": False,
        "bottleneck_span": None,
        "spans": [
            {
                "span_id": "spn-auth-01",
                "parent_span_id": None,
                "service": "ingress-envoy-gateway",
                "name": "HTTP POST /api/v1/auth/login",
                "start_offset_ms": 0,
                "duration_ms": 38,
                "status": "OK",
                "attributes": {"http.status_code": 200}
            },
            {
                "span_id": "spn-auth-02",
                "parent_span_id": "spn-auth-01",
                "service": "postgres-cluster",
                "name": "postgres.query.users (Bcrypt Hash Verify)",
                "start_offset_ms": 6,
                "duration_ms": 22,
                "status": "OK",
                "attributes": {"db.statement": "SELECT id, password_hash FROM users WHERE email = $1;"}
            },
            {
                "span_id": "spn-auth-03",
                "parent_span_id": "spn-auth-01",
                "service": "auth-service",
                "name": "JWT Token Sign & Cookie Generation",
                "start_offset_ms": 30,
                "duration_ms": 7,
                "status": "OK",
                "attributes": {"jwt.exp_hours": 24}
            }
        ]
    }
]


class TracingService:
    """
    Retrieves and analyzes OpenTelemetry distributed trace sessions.
    """

    @staticmethod
    def get_recent_traces() -> List[Dict[str, Any]]:
        return CANONICAL_TRACES

    @staticmethod
    def get_trace_by_id(trace_id: str) -> Dict[str, Any]:
        target = next((t for t in CANONICAL_TRACES if t["trace_id"] == trace_id), CANONICAL_TRACES[0])
        return target
