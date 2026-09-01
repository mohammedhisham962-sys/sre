class PolicyAgent:
    def enforce(self, action_type: str, user_role: str = "SYSTEM") -> dict:
        """
        Strict policy enforcement checking if an action is allowed.
        """
        AUTOMATIC_ACTIONS = ["RETRY_JOB", "RESTART_APPROVED_SERVICE", "CLEAR_CACHE", "RUN_TESTS", "CREATE_BRANCH"]
        APPROVAL_REQUIRED = ["DEPLOY_CODE", "UPGRADE_DEPENDENCY", "CONFIG_CHANGE"]
        MANUAL_ONLY = ["DROP_DATABASE", "FIREWALL_CHANGE", "DELETE_INFRA"]

        if action_type in AUTOMATIC_ACTIONS:
            return {"allowed": True, "level": "AUTOMATIC", "reason": "Action is globally allowlisted."}
        elif action_type in APPROVAL_REQUIRED:
            if user_role == "ADMIN" or user_role == "ENGINEER":
                return {"allowed": True, "level": "APPROVAL_REQUIRED", "reason": "Human approval provided."}
            else:
                return {"allowed": False, "level": "APPROVAL_REQUIRED", "reason": "Human approval missing."}
        elif action_type in MANUAL_ONLY:
            if user_role == "ADMIN":
                return {"allowed": True, "level": "MANUAL_ONLY", "reason": "Admin manually executed."}
            else:
                return {"allowed": False, "level": "MANUAL_ONLY", "reason": "Restricted to ADMIN only."}
                
        return {"allowed": False, "level": "UNKNOWN", "reason": "Action not recognized in policy engine."}

policy_agent = PolicyAgent()
