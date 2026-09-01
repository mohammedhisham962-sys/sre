import os

base_dir = r"C:\Users\moham\.gemini\antigravity\scratch\aigra-ops\backend\app"

api_files = {
    "repairs.py": """from fastapi import APIRouter
router = APIRouter()
@router.post("/")
def create_repair_plan(): return {"status": "created"}
""",
    "testing.py": """from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def get_test_results(): return []
""",
    "security.py": """from fastapi import APIRouter
router = APIRouter()
@router.get("/scan")
def trigger_scan(): return {"status": "scanning"}
""",
    "approvals.py": """from fastapi import APIRouter
router = APIRouter()
@router.post("/{id}/approve")
def approve_action(id: int): return {"status": "approved"}
"""
}

# Write API files
for filename, content in api_files.items():
    with open(os.path.join(base_dir, "api", filename), "w") as f:
        f.write(content)

# Update main.py
main_py_path = os.path.join(base_dir, "main.py")
with open(main_py_path, "r") as f:
    main_content = f.read()

if "repairs_router" not in main_content:
    imports = """from .api.repairs import router as repairs_router
from .api.testing import router as testing_router
from .api.security import router as security_router
from .api.approvals import router as approvals_router
"""
    routes = """api_v1_router.include_router(repairs_router, prefix="/repairs", tags=["repairs"])
api_v1_router.include_router(testing_router, prefix="/testing", tags=["testing"])
api_v1_router.include_router(security_router, prefix="/security", tags=["security"])
api_v1_router.include_router(approvals_router, prefix="/approvals", tags=["approvals"])
"""
    
    main_content = main_content.replace("from .api.health import router as health_router", "from .api.health import router as health_router\n" + imports)
    main_content = main_content.replace("app.include_router(api_v1_router, prefix=\"/api/v1\")", routes + "\napp.include_router(api_v1_router, prefix=\"/api/v1\")")
    
    with open(main_py_path, "w") as f:
        f.write(main_content)

print("Final APIs and routes fully scaffolded.")
