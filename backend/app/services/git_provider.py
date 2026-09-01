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

    def clone_repository(self, repo_url: str, workspace_path: str, token: str = None):
        """
        Clones the repository into the workspace. Injects token into URL if provided.
        """
        if token and repo_url.startswith("https://github.com/"):
            auth_url = repo_url.replace("https://", f"https://x-access-token:{token}@")
        else:
            auth_url = repo_url

        logger.info(f"Cloning repository into {workspace_path}")
        self.execute_git_command(["clone", auth_url, "."], cwd=workspace_path)

    def push_branch(self, workspace_path: str, branch_name: str):
        """
        Pushes a branch to the origin.
        """
        logger.info(f"Pushing branch {branch_name} from {workspace_path}")
        self.execute_git_command(["push", "-u", "origin", branch_name], cwd=workspace_path)

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

    def apply_patch(self, workspace_path: str, patch_content: str):
        """
        Applies a unified diff patch.
        """
        patch_file = os.path.join(workspace_path, "ai_repair.patch")
        with open(patch_file, "w") as f:
            f.write(patch_content)
        logger.info(f"Applying patch in {workspace_path}")
        self.execute_git_command(["apply", "ai_repair.patch"], cwd=workspace_path)
        os.remove(patch_file)

    def commit_changes(self, workspace_path: str, message: str):
        """
        Commits all changes in the workspace.
        """
        self.execute_git_command(["add", "-A"], cwd=workspace_path)
        # Configure dummy user for committing locally in sandbox
        self.execute_git_command(["config", "user.email", "ai@aigra.ops"], cwd=workspace_path)
        self.execute_git_command(["config", "user.name", "AIGRA AI"], cwd=workspace_path)
        self.execute_git_command(["commit", "-m", message], cwd=workspace_path)
        logger.info(f"Committed changes with message: '{message}'")

    def get_tree(self, workspace_path: str) -> str:
        """
        Returns a simplified directory tree for AI context.
        """
        return self.execute_git_command(["ls-tree", "-r", "--name-only", "HEAD"], cwd=workspace_path)

    def get_commit_log(self, workspace_path: str) -> str:
        """
        Gets recent commit logs.
        """
        return self.execute_git_command(["log", "-n", "1", "--oneline"], cwd=workspace_path)

git_provider = GitProvider()
