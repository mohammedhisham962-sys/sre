import os
import shutil
import tempfile
from ..logger import logger

class WorkspaceManager:
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or os.path.join(tempfile.gettempdir(), "aigra_workspaces")
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def create_workspace(self, project_id: int, incident_id: int) -> str:
        """
        Creates an isolated workspace for a specific incident repair attempt.
        """
        workspace_name = f"project_{project_id}_incident_{incident_id}"
        workspace_path = os.path.join(self.base_dir, workspace_name)
        
        # Ensure it's clean if it somehow already exists
        if os.path.exists(workspace_path):
            self.cleanup_workspace(workspace_path)
            
        os.makedirs(workspace_path)
        logger.info(f"Created isolated workspace at {workspace_path}")
        return workspace_path

    def cleanup_workspace(self, workspace_path: str):
        """
        Wipes the directory to ensure no artifacts or credentials are left behind.
        """
        if os.path.exists(workspace_path) and self.base_dir in workspace_path: # Security check to prevent rm -rf /
            try:
                # Windows might have read-only files (e.g. .git/objects) that shutil.rmtree struggles with unless handled
                def handle_remove_readonly(func, path, exc):
                    import stat
                    excvalue = exc[1]
                    if func in (os.rmdir, os.remove, os.unlink) and excvalue.errno == errno.EACCES:
                        os.chmod(path, stat.S_IRWXU| stat.S_IRWXG| stat.S_IRWXO) # 0777
                        func(path)
                    else:
                        raise
                
                shutil.rmtree(workspace_path, ignore_errors=True)
                logger.info(f"Cleaned up isolated workspace at {workspace_path}")
            except Exception as e:
                logger.error(f"Failed to cleanup workspace {workspace_path}: {e}")

workspace_manager = WorkspaceManager()
