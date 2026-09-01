from typing import Dict, Any

class AIAdminAssistant:
    @staticmethod
    def process_command(command: str) -> Dict[str, Any]:
        """
        Parses a natural language command and converts it to a structured action.
        """
        command_lower = command.lower()
        
        if "monitor all" in command_lower:
            return {
                "intent": "UPDATE_MONITORING",
                "action": "Enable monitoring for all projects",
                "risk": "LOW"
            }
        elif "analyze" in command_lower:
            return {
                "intent": "RUN_DIAGNOSIS",
                "action": "Trigger Root Cause Analysis on specified target",
                "risk": "LOW"
            }
        elif "repair" in command_lower and "low-risk" in command_lower:
            return {
                "intent": "UPDATE_POLICY",
                "action": "Set auto-repair policy to AUTOMATIC for low-risk incidents",
                "risk": "MEDIUM"
            }
        
        return {
            "intent": "UNKNOWN",
            "action": "Could not parse command. Please try rephrasing.",
            "risk": "NONE"
        }

admin_assistant = AIAdminAssistant()
