import uuid
from datetime import datetime, timezone
from app.core.config import settings
from app.schemas.issue import IssueCreate, IssueUpdate
from app.repositories.base import BaseIssueRepository
from app.repositories.sqlite_repo import SQLiteIssueRepository
from app.repositories.firestore_repo import FirestoreIssueRepository
from app.services.ai.agents import CivicAIWorkflow

class IssueService:
    def __init__(self, repo: BaseIssueRepository, ai_workflow: CivicAIWorkflow):
        self.repo = repo
        self.ai = ai_workflow

    async def create_issue(self, issue_in: IssueCreate, reporter_id: str, reporter_name: str) -> dict:
        """Runs the Multi-Agent AI triage/prediction pipeline and creates the issue record in the active repository."""
        issue_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        # Analyze with Multi-Agent AI Pipeline
        ai_analysis = None
        severity = "medium"
        priority_score = 50.0
        try:
            ai_analysis = await self.ai.run_pipeline(
                title=issue_in.title,
                description=issue_in.description,
                category=issue_in.category,
                lat=issue_in.location.lat,
                lng=issue_in.location.lng,
                image_urls=issue_in.image_urls
            )
            severity = ai_analysis.severity
            priority_score = ai_analysis.priority_score
        except Exception:
            pass
            
        doc_data = {
            "id": issue_id,
            "title": issue_in.title,
            "description": issue_in.description,
            "category": issue_in.category,
            "status": "ai_triaged" if ai_analysis else "reported",
            "severity": severity,
            "priorityScore": priority_score,
            "location": issue_in.location.model_dump(),
            "address": issue_in.address,
            "imageUrls": issue_in.image_urls,
            "reporterId": reporter_id,
            "reporterName": reporter_name,
            "assignedOfficerId": None,
            "department": ai_analysis.department if ai_analysis else None,
            "ai": ai_analysis.model_dump(by_alias=True) if ai_analysis else None,
            "upvotes": 0,
            "verifications": 0,
            "createdAt": now,
            "updatedAt": now,
            "resolvedAt": None
        }
        
        return await self.repo.create(issue_id, issue_in, doc_data)
        
    async def get_issue(self, issue_id: str) -> dict | None:
        """Gets issue details from active repository."""
        return await self.repo.get(issue_id)

    async def list_issues(self, category: str | None = None, status: str | None = None) -> list[dict]:
        """Lists active issues using active repository."""
        return await self.repo.list_all(category, status)
        
    async def update_issue(self, issue_id: str, update_in: IssueUpdate) -> dict | None:
        """Updates issue details using active repository."""
        return await self.repo.update(issue_id, update_in)

    async def upvote_issue(self, issue_id: str) -> int:
        """Increments citizen upvotes count using active repository."""
        return await self.repo.increment_upvotes(issue_id)

    async def verify_issue(self, issue_id: str, positive: bool = True) -> int:
        """Increments neighbourhood validations count using active repository."""
        return await self.repo.increment_verifications(issue_id, positive)

def get_issue_repository() -> BaseIssueRepository:
    """Factory resolver to load either SQLite or Firestore issue repositories based on DB_PROVIDER."""
    if settings.db_provider == "firestore":
        return FirestoreIssueRepository()
    return SQLiteIssueRepository()

def get_ai_workflow() -> CivicAIWorkflow:
    """Factory to load the multi-agent AI pipeline orchestrator."""
    return CivicAIWorkflow()

def get_issue_service() -> IssueService:
    """Injects active repository and Multi-Agent AI references into the IssueService."""
    return IssueService(repo=get_issue_repository(), ai_workflow=get_ai_workflow())