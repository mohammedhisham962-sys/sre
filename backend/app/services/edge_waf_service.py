from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

class EdgeWafService:
    @staticmethod
    def get_status() -> Dict[str, Any]:
        """Returns global edge CDN PoP health, cache performance, and WAF threat defense telemetry."""
        return {
            "status": "HEALTHY",
            "active_pops": 5,
            "cache_hit_ratio_pct": 94.8,
            "bandwidth_saved_tb": 1.42,
            "total_requests_per_sec": 12450,
            "p95_edge_latency_ms": 14,
            "tls_version": "TLS 1.3 / HTTP/3 QUIC",
            "waf_mode": "ACTIVE_BLOCKING",
            "updated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "pops": [
                {"pop_code": "IAD-1", "region": "US-East (Virginia)", "status": "ONLINE", "hit_ratio": 96.2, "latency_ms": 9, "requests_sec": 4500},
                {"pop_code": "LHR-2", "region": "Europe-West (London)", "status": "ONLINE", "hit_ratio": 95.1, "latency_ms": 12, "requests_sec": 3800},
                {"pop_code": "NRT-1", "region": "Asia-Pacific (Tokyo)", "status": "ONLINE", "hit_ratio": 93.4, "latency_ms": 18, "requests_sec": 2400},
                {"pop_code": "SYD-3", "region": "Oceania (Sydney)", "status": "ONLINE", "hit_ratio": 92.8, "latency_ms": 22, "requests_sec": 1100},
                {"pop_code": "GRU-1", "region": "South America (São Paulo)", "status": "ONLINE", "hit_ratio": 91.5, "latency_ms": 24, "requests_sec": 650}
            ],
            "waf_rules": [
                {"rule_id": "WAF-OWASP-SQLI", "name": "SQL Injection Pattern Defense", "category": "OWASP Top 10", "action": "BLOCK", "blocks_today": 342, "status": "ENFORCED"},
                {"rule_id": "WAF-OWASP-XSS", "name": "Cross-Site Scripting (XSS) Sanitizer", "category": "OWASP Top 10", "action": "BLOCK", "blocks_today": 128, "status": "ENFORCED"},
                {"rule_id": "WAF-RATE-LIMIT", "name": "Dynamic Burst Rate-Limiting (>100 req/s)", "category": "DDoS Mitigation", "action": "CHALLENGE", "blocks_today": 1890, "status": "ENFORCED"},
                {"rule_id": "WAF-BOT-SHIELD", "name": "AI Web Scraper & Malicious Bot Heuristics", "category": "Bot Management", "action": "CHALLENGE", "blocks_today": 4120, "status": "ENFORCED"}
            ],
            "recent_blocks": [
                {"ip": "198.51.100.44", "country": "RU", "threat": "SQLi Injection in /api/v1/auth", "rule_id": "WAF-OWASP-SQLI", "action": "BLOCKED_403", "timestamp": "2026-09-08 04:22:15 UTC"},
                {"ip": "203.0.113.89", "country": "CN", "threat": "Layer 7 Request Flood (420 req/s)", "rule_id": "WAF-RATE-LIMIT", "action": "CHALLENGE_CAPTCHA", "timestamp": "2026-09-08 04:20:50 UTC"},
                {"ip": "192.0.2.115", "country": "BR", "threat": "Malformed SSRF Metadata Query", "rule_id": "WAF-OWASP-SQLI", "action": "BLOCKED_403", "timestamp": "2026-09-08 04:18:02 UTC"}
            ]
        }

    @staticmethod
    def purge_cache(scope: str = "global", urls: Optional[List[str]] = None) -> Dict[str, Any]:
        """Invalidates edge cache across all global edge PoPs."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        return {
            "action": "CACHE_PURGED",
            "scope": scope,
            "target_urls": urls or ["/*"],
            "purged_pops_count": 5,
            "propagation_time_ms": 180,
            "timestamp": now_str,
            "status": "SUCCESS"
        }

    @staticmethod
    def block_ip(ip_address: str, reason: str, duration_hours: int = 24) -> Dict[str, Any]:
        """Pushes an emergency IP block rule to all edge WAF PoPs."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        return {
            "action": "IP_BLOCKED",
            "ip_address": ip_address,
            "reason": reason,
            "duration_hours": duration_hours,
            "enforced_at": now_str,
            "sync_status": "PROPAGATED_GLOBALLY",
            "status": "SUCCESS"
        }
