from typing import Optional, Dict, Any

class PolicyEngine:
    @staticmethod
    def evaluate_action(action_type: str) -> str:
        """
        Evaluates an action against the policy engine rules.
        Returns the required approval level: AUTOMATIC, APPROVAL_REQUIRED, or MANUAL_ONLY.
        """
        # Hardcoded default policies for MVP
        automatic_actions = ["RETRY_JOB", "RESTART_APPROVED_SERVICE", "CLEAR_CACHE", "RUN_TESTS"]
        approval_required = ["DEPLOY_CODE", "UPGRADE_DEPENDENCY", "CONFIG_CHANGE"]
        manual_only = ["DROP_DATABASE", "FIREWALL_CHANGE", "DELETE_INFRA"]

        if action_type in automatic_actions:
            return "AUTOMATIC"
        elif action_type in approval_required:
            return "APPROVAL_REQUIRED"
        elif action_type in manual_only:
            return "MANUAL_ONLY"
        
        # Default fallback for unknown actions
        return "APPROVAL_REQUIRED"

policy_engine = PolicyEngine()
