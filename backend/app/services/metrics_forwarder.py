import time
import httpx
from typing import Dict, Any, List
from ..logger import logger

class MetricsForwarder:
    """
    Multi-Cloud Metrics Forwarder.
    Streams Prometheus gauges, error budgets, and latency percentiles to Datadog and Grafana Cloud.
    """

    @staticmethod
    def format_datadog_series(metrics_dict: Dict[str, float]) -> Dict[str, Any]:
        """
        Formats metrics into Datadog API v1 series payload.
        """
        now = int(time.time())
        series = []
        for metric_name, value in metrics_dict.items():
            series.append({
                "metric": f"aigra.{metric_name}",
                "points": [[now, value]],
                "type": "gauge",
                "tags": ["environment:production", "platform:aigra_ops"]
            })
        return {"series": series}

    @staticmethod
    def format_grafana_prometheus(metrics_dict: Dict[str, float]) -> str:
        """
        Formats metrics into Prometheus text exposition format for Grafana Cloud Push Gateway.
        """
        lines = []
        for metric_name, value in metrics_dict.items():
            clean_name = f"aigra_{metric_name.replace('.', '_')}"
            lines.append(f"# TYPE {clean_name} gauge")
            lines.append(f"{clean_name}{{environment=\"production\"}} {value}")
        return "\n".join(lines) + "\n"

    @staticmethod
    async def forward_to_datadog(api_key: str, metrics: Dict[str, float]) -> bool:
        """
        Pushes metrics to Datadog API.
        """
        if not api_key:
            logger.info("Datadog Forwarder: No API key provided (Simulation mode pass).")
            return True
        
        payload = MetricsForwarder.format_datadog_series(metrics)
        url = f"https://api.datadoghq.com/api/v1/series?api_key={api_key}"
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(url, json=payload, timeout=5.0)
                return res.status_code in [200, 202]
        except Exception as e:
            logger.error(f"Datadog forward failed: {str(e)}")
            return False

metrics_forwarder = MetricsForwarder()
