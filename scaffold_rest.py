import os

# Define the base directory
base_dir = r"C:\Users\moham\.gemini\antigravity\scratch\aigra-ops"

# --- BACKEND FILES ---

backend_files = {
    r"backend\app\api\deployments.py": """from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_deployments():
    return [{"id": 1, "status": "SUCCESS", "environment": "production"}]
""",
    r"backend\app\api\policies.py": """from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_policies():
    return [{"id": 1, "name": "Auto-Repair Low Risk", "action_type": "RESTART"}]
""",
    r"backend\app\api\admin.py": """from fastapi import APIRouter
router = APIRouter()
@router.get("/audit")
def get_audit_logs():
    return [{"id": 1, "action": "CREATE_PROJECT", "user": "admin"}]
""",
    r"backend\app\agents\monitor_agent.py": """class MonitorAgent:
    def check_health(self, target):
        return {"status": "HEALTHY"}
monitor_agent = MonitorAgent()
""",
    r"backend\app\agents\policy_agent.py": """class PolicyAgent:
    def enforce(self, action):
        return True
policy_agent = PolicyAgent()
""",
    r"backend\app\services\log_service.py": """class LogService:
    def fetch_logs(self):
        return ["Error: timeout", "Warning: high memory"]
log_service = LogService()
""",
    r"backend\app\services\git_service.py": """class GitService:
    def create_branch(self, name):
        return True
git_service = GitService()
""",
    r"backend\app\services\patch_service.py": """class PatchService:
    def apply_patch(self, patch):
        return True
patch_service = PatchService()
""",
    r"backend\app\services\testing_service.py": """class TestingService:
    def run_tests(self):
        return {"passed": True}
testing_service = TestingService()
""",
    r"backend\app\services\deployment_service.py": """class DeploymentService:
    def deploy(self, target):
        return {"status": "DEPLOYED"}
deployment_service = DeploymentService()
""",
    r"backend\app\services\notification_service.py": """class NotificationService:
    def send_alert(self, message):
        pass
notification_service = NotificationService()
"""
}

# --- FRONTEND FILES ---

frontend_page_template = """export default function {name}() {{
  return (
    <main className="p-12 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
        <a href="/" className="text-blue-600 hover:underline">← Back to Dashboard</a>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">This module is part of the AIGRA Ops platform.</p>
      </div>
    </main>
  );
}}
"""

frontend_pages = [
    ("incidents", "Incidents"),
    ("analysis", "AI Analysis"),
    ("deployments", "Deployments"),
    ("policies", "Policies"),
    ("approvals", "Approvals"),
    ("audit", "Audit Logs"),
    ("assistant", "AI Admin Assistant"),
    ("settings", "Settings")
]

# Write backend files
for rel_path, content in backend_files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)

# Write frontend files
for folder, name in frontend_pages:
    full_path = os.path.join(base_dir, "frontend", "app", folder, "page.tsx")
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(frontend_page_template.format(name=name))

print("Scaffolding completed successfully.")
