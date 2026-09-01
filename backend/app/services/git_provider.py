import subprocess
import os
from ..logger import logger

class GitProvider:
    def execute_git_command(self, cmd: list, cwd: str) -> str:
        """
        Executes a git command in the isolated workspace.
        """
        try:
            result = subprocess.run(
                ["git"] + cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logger.error(f"Git command failed: git {' '.join(cmd)}\nError: {e.stderr}")
            raise Exception(f"Git command failed: {e.stderr}")

    def clone_repository(self, repo_url: str, workspace_path: str):
        """
        Clones the repository into the workspace.
        """
        logger.info(f"Cloning {repo_url} into {workspace_path}")
        self.execute_git_command(["clone", repo_url, "."], cwd=workspace_path)

    def create_repair_branch(self, workspace_path: str, branch_name: str):
        """
        Enforces the 'never modify main branch directly' rule by checking out a new branch.
        """
        logger.info(f"Creating repair branch {branch_name} in {workspace_path}")
        self.execute_git_command(["checkout", "-b", branch_name], cwd=workspace_path)

    def generate_diff(self, workspace_path: str) -> str:
        """
        Generates a diff of the changes made by the AI.
        """
        return self.execute_git_command(["diff"], cwd=workspace_path)

    def get_status(self, workspace_path: str) -> str:
        """
        Gets the current git status.
        """
        return self.execute_git_command(["status"], cwd=workspace_path)

git_provider = GitProvider()
