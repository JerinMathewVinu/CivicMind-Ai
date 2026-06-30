from abc import ABC, abstractmethod
from app.schemas.user import UserProfile
from app.schemas.issue import IssueCreate, IssueUpdate

class BaseUserRepository(ABC):
    @abstractmethod
    async def get_by_uid(self, uid: str) -> UserProfile | None:
        """Fetch user profile by unique ID."""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> dict | None:
        """Fetch raw user dict by email address (for authentication verification)."""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> dict | None:
        """Fetch raw user dict by username."""
        pass

    @abstractmethod
    async def register(self, username: str, email: str, password_hash: str, display_name: str, role: str) -> UserProfile:
        """Register and insert a new user profile record."""
        pass

    @abstractmethod
    async def get_leaderboard(self, limit: int) -> list[dict]:
        """Fetch sorted leaderboard lists based on citizen points (XP)."""
        pass

class BaseIssueRepository(ABC):
    @abstractmethod
    async def create(self, issue_id: str, issue_in: IssueCreate, doc_data: dict) -> dict:
        """Create and persist a new civic issue report."""
        pass

    @abstractmethod
    async def get(self, issue_id: str) -> dict | None:
        """Get issue details by report ID."""
        pass

    @abstractmethod
    async def list_all(self, category: str | None = None, status: str | None = None) -> list[dict]:
        """List active civic reports, supporting category and status filters."""
        pass

    @abstractmethod
    async def update(self, issue_id: str, update_in: IssueUpdate) -> dict | None:
        """Update issue assignment or status fields."""
        pass

    @abstractmethod
    async def increment_upvotes(self, issue_id: str) -> int:
        """Increment upvotes count on a reported issue."""
        pass

    @abstractmethod
    async def increment_verifications(self, issue_id: str, positive: bool = True) -> int:
        """Increment citizen verifications, resolving or reopening the issue based on votes count."""
        pass
