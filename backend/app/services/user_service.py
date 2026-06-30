from app.core.config import settings
from app.schemas.user import UserProfile
from app.repositories.base import BaseUserRepository
from app.repositories.sqlite_repo import SQLiteUserRepository
from app.repositories.firestore_repo import FirestoreUserRepository

class UserService:
    def __init__(self, repo: BaseUserRepository):
        self.repo = repo

    async def get_user_by_uid(self, uid: str) -> UserProfile | None:
        """Fetch profile details from the active repository database."""
        return await self.repo.get_by_uid(uid)

    async def get_user_by_email(self, email: str) -> dict | None:
        """Fetch raw credentials record by email."""
        return await self.repo.get_by_email(email)

    async def get_user_by_username(self, username: str) -> dict | None:
        """Fetch raw credentials record by username."""
        return await self.repo.get_by_username(username)

    async def register_user(self, username: str, email: str, password_hash: str, display_name: str, role: str = "citizen") -> UserProfile:
        """Register a new user in the active repository."""
        return await self.repo.register(
            username=username,
            email=email,
            password_hash=password_hash,
            display_name=display_name,
            role=role
        )

    async def get_leaderboard(self, limit: int = 10) -> list[dict]:
        """Queries rankings from the active repository database."""
        return await self.repo.get_leaderboard(limit)

def get_user_repository() -> BaseUserRepository:
    """Factory resolver to load either SQLite or Firestore repositories based on DB_PROVIDER."""
    if settings.db_provider == "firestore":
        return FirestoreUserRepository()
    return SQLiteUserRepository()

def get_user_service() -> UserService:
    """Injects the resolved repository into a new UserService instance."""
    return UserService(repo=get_user_repository())