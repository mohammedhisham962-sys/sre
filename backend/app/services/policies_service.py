from typing import List, Dict

class PoliciesService:
    def __init__(self):
        self.active_policies = [
            {"id": "POL-001", "name": "Restrict Privileged Containers", "framework": "OPA Gatekeeper", "enforcement": "Block"},
            {"id": "POL-002", "name": "Require Resource Quotas", "framework": "OPA Gatekeeper", "enforcement": "Audit"},
            {"id": "POL-003", "name": "Prohibit Public S3 Buckets", "framework": "Terraform Checkov", "enforcement": "Block"}
        ]
        
        self.recent_evaluations = [
            {"pipeline_id": "CI-889", "resource": "deployment/redis-cache", "policy_id": "POL-001", "result": "DENY", "message": "Container runs as root"},
            {"pipeline_id": "CI-888", "resource": "aws_s3_bucket.assets", "policy_id": "POL-003", "result": "PASS", "message": "Bucket is private"}
        ]

    def get_policies_overview(self):
        return {
            "policies": self.active_policies,
            "evaluations": self.recent_evaluations,
            "compliance_score": 88.5
        }

    def evaluate_manifest(self, manifest_yaml: str) -> Dict:
        # Simulate basic evaluation logic
        if "privileged: true" in manifest_yaml.lower() or "runasuser: 0" in manifest_yaml.lower():
            return {
                "status": "DENY",
                "violations": [
                    {"policy": "POL-001", "message": "Container security context requests privileged execution or root user."}
                ]
            }
        return {
            "status": "PASS",
            "violations": []
        }

policies_service = PoliciesService()
