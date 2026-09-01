from typing import Dict, Any
from .repair_agent import repair_agent
from .patch_review_agent import patch_review_agent
from .testing_agent import testing_agent
from .security_agent import security_agent
from .deployment_agent import deployment_agent
from .policy_agent import policy_agent

class Orchestrator:
    """
    Coordinates the entire mandatory repair pipeline ensuring strict policy controls.
    """
    
    @staticmethod
    def run_repair_pipeline(incident_id: int, root_cause: str) -> Dict[str, Any]:
        pipeline_log = []
        
        # 1. Generate Patch
        patch = repair_agent.generate_patch(incident_id, root_cause)
        pipeline_log.append({"stage": "REPAIR_GENERATION", "result": patch})
        
        # 2. Patch Review
        review = patch_review_agent.review_patch(patch)
        pipeline_log.append({"stage": "PATCH_REVIEW", "result": review})
        if not review["approved_for_testing"]:
            return {"status": "BLOCKED_AT_REVIEW", "log": pipeline_log}
            
        # 3. Security Scan
        security = security_agent.run_security_scan(patch["branch_name"])
        pipeline_log.append({"stage": "SECURITY_SCAN", "result": security})
        if security["status"] != "PASSED":
            return {"status": "BLOCKED_AT_SECURITY", "log": pipeline_log}
            
        # 4. Mandatory Testing Pipeline
        testing = testing_agent.execute_testing_pipeline(patch["branch_name"])
        pipeline_log.append({"stage": "TESTING_PIPELINE", "result": testing})
        if not testing["patch_allowed_to_continue"]:
            return {"status": "BLOCKED_AT_TESTING", "log": pipeline_log}
            
        # 5. Policy Check for Deployment
        policy_check = policy_agent.enforce("DEPLOY_CODE", user_role="SYSTEM")
        pipeline_log.append({"stage": "POLICY_CHECK", "result": policy_check})
        
        if not policy_check["allowed"]:
            # Staging deployment is allowed for testing
            staging = deployment_agent.deploy_to_staging(patch["branch_name"])
            pipeline_log.append({"stage": "STAGING_DEPLOYMENT", "result": staging})
            return {
                "status": "READY_FOR_APPROVAL", 
                "confidence_score": 94,
                "log": pipeline_log,
                "block_reason": policy_check["reason"]
            }
            
        # If somehow allowed (e.g., human triggered), proceed
        prod = deployment_agent.deploy_to_production(patch["branch_name"])
        pipeline_log.append({"stage": "PROD_DEPLOYMENT", "result": prod})

orchestrator = Orchestrator()
