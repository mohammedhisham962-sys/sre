import httpx
import asyncio
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.webhook import WebhookConfig
from ..logger import logger

class WebhookDispatcher:
    @staticmethod
    async def dispatch_event(event_type: str, title: str, description: str, severity: str = "INFO", details: dict = None):
        """
        Dispatches outbound webhook alerts to all configured active channels.
        """
        db = SessionLocal()
        try:
            webhooks = db.query(WebhookConfig).filter(WebhookConfig.is_active == True).all()
            if not webhooks:
                return

            tasks = []
            for wh in webhooks:
                # Check trigger filter
                if "INCIDENT" in event_type and not wh.trigger_incidents:
                    continue
                if "REPAIR" in event_type and not wh.trigger_repairs:
                    continue
                if "SECURITY" in event_type and not wh.trigger_security:
                    continue

                tasks.append(WebhookDispatcher._send_webhook(wh, event_type, title, description, severity, details))

            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
        except Exception as e:
            logger.error(f"Webhook dispatch failed: {str(e)}")
        finally:
            db.close()

    @staticmethod
    async def _send_webhook(wh: WebhookConfig, event_type: str, title: str, description: str, severity: str, details: dict):
        payload = {}
        if wh.channel_type == "SLACK":
            emoji = "🚨" if severity == "CRITICAL" else "⚠️" if severity == "WARNING" else "✅"
            payload = {
                "text": f"{emoji} *[AIGRA Ops Alert]* {title}\n{description}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": f"{emoji} *[AIGRA Ops]* {title}\n{description}"}
                    }
                ]
            }
        elif wh.channel_type == "DISCORD":
            color = 15158332 if severity == "CRITICAL" else 15844367 if severity == "WARNING" else 3066993
            payload = {
                "embeds": [
                    {
                        "title": f"🚨 {title}",
                        "description": description,
                        "color": color,
                        "fields": [
                            {"name": "Event Type", "value": event_type, "inline": True},
                            {"name": "Severity", "value": severity, "inline": True}
                        ]
                    }
                ]
            }
        else: # CUSTOM_HTTP
            payload = {
                "platform": "AIGRA_OPS",
                "event_type": event_type,
                "title": title,
                "description": description,
                "severity": severity,
                "details": details or {}
            }

        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(wh.url, json=payload, timeout=5.0)
                logger.info(f"Dispatched webhook to '{wh.name}' ({wh.channel_type}) -> Status {res.status_code}")
        except Exception as e:
            logger.warning(f"Failed to post webhook to {wh.url}: {str(e)}")

webhook_dispatcher = WebhookDispatcher()
