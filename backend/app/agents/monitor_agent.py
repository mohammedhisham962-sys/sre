class MonitorAgent:
    def check_health(self, target):
        return {"status": "HEALTHY"}
monitor_agent = MonitorAgent()
