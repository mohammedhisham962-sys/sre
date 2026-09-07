from typing import Dict, Any
from ..logger import logger
from .audit_service import audit_service

class CanaryGuardrailEngine:
    """
    Canary Release & Automated Rollback Guardrail Engine.
    Monitors canary traffic vs baseline and triggers automated rollback if degradation is detected.
    """

    @staticmethod
    def evaluate_canary(
        canary_version: str,
        baseline_latency_ms: float,
        canary_latency_ms: float,
        baseline_error_rate: float,
        canary_error_rate: float,
        db: Any = None
    ) -> Dict[str, Any]:
        """
        Evaluates canary health against baseline SRE thresholds:
        - Latency increase threshold: +15%
        - Error rate threshold: +5%
        """
        latency_delta_pct = ((canary_latency_ms - baseline_latency_ms) / baseline_latency_ms) * 100.0 if baseline_latency_ms > 0 else 0.0
        error_rate_delta_pct = (canary_error_rate - baseline_error_rate) * 100.0

        is_degraded = (latency_delta_pct > 15.0) or (canary_error_rate > 0.05)
        
        if is_degraded:
            action = "AUTO_ROLLBACK_TRIGGERED"
            reason = f"Canary exceeded SLO guardrails (Latency: +{latency_delta_pct:.1f}%, Error Rate: {canary_error_rate*100:.1f}%)"
            
            audit_service.log_event(
                event_type="CANARY_AUTO_ROLLBACK",
                summary=f"Automated rollback triggered for canary {canary_version}: {reason}",
                actor="CANARY_GUARD_ENGINE",
                severity="CRITICAL",
                target=f"release://{canary_version}",
                details={
                    "latency_delta_pct": latency_delta_pct,
                    "canary_error_rate": canary_error_rate,
                    "action": "TRAFFIC_ROUTED_TO_BASELINE"
                },
                db=db
            )
            logger.warning(f"Canary {canary_version} failed guardrail! {reason}")
        else:
            action = "PROMOTED_TO_PRODUCTION"
            reason = f"Canary within acceptable bounds (Latency: +{latency_delta_pct:.1f}%, Error Rate: {canary_error_rate*100:.1f}%)"
            
            audit_service.log_event(
                event_type="CANARY_PROMOTED",
                summary=f"Canary {canary_version} passed all guardrails and promoted to 100% traffic",
                actor="CANARY_GUARD_ENGINE",
                severity="SUCCESS",
                target=f"release://{canary_version}",
                details={"latency_delta_pct": latency_delta_pct, "canary_error_rate": canary_error_rate},
                db=db
            )
            logger.info(f"Canary {canary_version} passed guardrail! {reason}")

        return {
            "canary_version": canary_version,
            "decision": action,
            "is_degraded": is_degraded,
            "reason": reason,
            "metrics": {
                "baseline_latency_ms": baseline_latency_ms,
                "canary_latency_ms": canary_latency_ms,
                "latency_delta_pct": round(latency_delta_pct, 2),
                "baseline_error_rate": baseline_error_rate,
                "canary_error_rate": canary_error_rate
            }
        }

canary_guard = CanaryGuardrailEngine()
