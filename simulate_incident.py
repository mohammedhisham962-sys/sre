import asyncio
from backend.app.models.incident import Incident
from backend.app.agents.orchestrator import orchestrator
import json

async def run_simulation():
    print("==================================================")
    print("AIGRA Ops - End-to-End Workflow Simulation")
    print("==================================================")
    
    print("\n[MONITORING] 🚨 Alert: High memory usage detected on web-server-01")
    
    # 1. Create a dummy incident
    incident = Incident(
        id=101,
        project_id=1,
        title="Memory Leak in Production API",
        description="Container memory usage exceeded 95% threshold for 5 minutes.",
        severity="HIGH",
        status="DETECTED"
    )
    print(f"[INCIDENT] 📝 Created Incident #{incident.id}: {incident.title} (Severity: {incident.severity})")
    
    # 2. Trigger Orchestrator
    print("\n[ORCHESTRATOR] 🤖 Initializing autonomous response pipeline...")
    
    # The handle_incident method in orchestrator is synchronous in our mock setup
    result = orchestrator.handle_incident(incident)
    
    print("\n[ORCHESTRATOR] ✅ Pipeline execution halted at Approval Gate.")
    print(f"Final Status: {result['status']}")
    print(f"Confidence Score: {result.get('confidence_score', 'N/A')}")
    if 'block_reason' in result:
        print(f"Block Reason: {result['block_reason']}")
        
    print("\n[PIPELINE LOG]")
    for entry in result.get('log', []):
        stage = entry.get('stage')
        if stage == "AI_DIAGNOSIS":
            print(f"  -> [AI_DIAGNOSIS] Found Root Cause: {entry['result'].get('root_cause')}")
        elif stage == "PATCH_REVIEW":
            print(f"  -> [PATCH_REVIEW] Approved for testing: {entry['result'].get('approved_for_testing')}")
        elif stage == "POLICY_CHECK":
            print(f"  -> [POLICY_CHECK] Allowed: {entry['result'].get('allowed')} | Reason: {entry['result'].get('reason')}")
        else:
            print(f"  -> [{stage}] {json.dumps(entry.get('result', {}))}")

    print("\n==================================================")
    print("Simulation Complete. Ready for Human Approval.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_simulation())
