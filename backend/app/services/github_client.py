import httpx
import os
from ..logger import logger

class GitHubClient:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN", None)
        self.base_url = "https://api.github.com"
        
    def has_token(self) -> bool:
        return bool(self.token)
        
    async def create_pull_request(self, repo_url: str, branch_name: str, title: str, body: str) -> str:
        """
        Creates a Pull Request against the default branch of the repository.
        Returns the HTML URL of the created PR, or a mock URL if no token exists.
        """
        if not self.has_token():
            logger.warning("No GITHUB_TOKEN set. Skipping PR creation and returning mock URL.")
            return f"https://github.com/mock-user/mock-repo/pulls/mock-123"
            
        # Parse repo_url: e.g., https://github.com/mohammedhisham962-sys/sre.git
        if not repo_url.startswith("https://github.com/"):
            raise ValueError("Only github.com repository URLs are supported for PRs.")
            
        repo_path = repo_url.replace("https://github.com/", "").replace(".git", "").strip("/")
        
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        payload = {
            "title": title,
            "head": branch_name,
            "base": "main", # Or master, typically we'd fetch the default branch but hardcoded to main for MVP
            "body": body
        }
        
        api_url = f"{self.base_url}/repos/{repo_path}/pulls"
        logger.info(f"Creating PR via GitHub API: POST {api_url}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, headers=headers, json=payload, timeout=10.0)
            
            if response.status_code == 422 and "already exists" in response.text:
                logger.info("PR already exists for this branch.")
                return f"https://github.com/{repo_path}/pulls"
                
            response.raise_for_status()
            data = response.json()
            return data.get("html_url")
            
    async def get_pull_requests(self, repo_url: str):
        """Fetches open pull requests for the repository."""
        if not self.has_token():
            return []
            
        repo_path = repo_url.replace("https://github.com/", "").replace(".git", "").strip("/")
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        api_url = f"{self.base_url}/repos/{repo_path}/pulls?state=open"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(api_url, headers=headers, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Error fetching PRs: {str(e)}")
                return []

github_client = GitHubClient()
