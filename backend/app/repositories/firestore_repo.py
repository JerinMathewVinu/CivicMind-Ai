from datetime import datetime, timezone
import uuid
from app.core.firebase import get_firestore
from app.schemas.user import UserProfile
from app.schemas.issue import IssueCreate, IssueUpdate
from app.repositories.base import BaseUserRepository, BaseIssueRepository

class FirestoreUserRepository(BaseUserRepository):
    def __init__(self):
        self.db = get_firestore()

    async def get_by_uid(self, uid: str) -> UserProfile | None:
        doc = self.db.collection("users").document(uid).get()
        if not doc.exists:
            return None
        data = doc.to_dict()
        return UserProfile(
            uid=data["uid"],
            email=data["email"],
            displayName=data["displayName"],
            role=data["role"],
            photoURL=data.get("photoURL"),
            points=data.get("points", 0),
            badges=data.get("badges", []),
            department=data.get("department"),
            createdAt=data["createdAt"]
        )

    async def get_by_email(self, email: str) -> dict | None:
        docs = self.db.collection("users").where("email", "==", email).limit(1).stream()
        for doc in docs:
            return doc.to_dict()
        return None

    async def get_by_username(self, username: str) -> dict | None:
        docs = self.db.collection("users").where("username", "==", username).limit(1).stream()
        for doc in docs:
            return doc.to_dict()
        return None

    async def register(self, username: str, email: str, password_hash: str, display_name: str, role: str) -> UserProfile:
        uid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        badges = ["Welcome Citizen"]
        
        doc_data = {
            "uid": uid,
            "email": email,
            "username": username,
            "password_hash": password_hash,
            "displayName": display_name,
            "role": role,
            "photoURL": None,
            "points": 10,
            "badges": badges,
            "department": None,
            "createdAt": now
        }
        self.db.collection("users").document(uid).set(doc_data)
        return UserProfile(**doc_data)

    async def get_leaderboard(self, limit: int) -> list[dict]:
        docs = self.db.collection("users").order_by("points", direction="DESCENDING").limit(limit).stream()
        leaderboard = []
        for rank, doc in enumerate(docs, 1):
            data = doc.to_dict()
            leaderboard.append({
                "uid": data["uid"],
                "displayName": data["displayName"],
                "photoURL": data.get("photoURL"),
                "points": data.get("points", 0),
                "reportsCount": len(data.get("badges", [])),
                "rank": rank
            })
        return leaderboard

class FirestoreIssueRepository(BaseIssueRepository):
    def __init__(self):
        self.db = get_firestore()

    async def create(self, issue_id: str, issue_in: IssueCreate, doc_data: dict) -> dict:
        self.db.collection("issues").document(issue_id).set(doc_data)
        return doc_data

    async def get(self, issue_id: str) -> dict | None:
        doc = self.db.collection("issues").document(issue_id).get()
        return doc.to_dict() if doc.exists else None

    async def list_all(self, category: str | None = None, status: str | None = None) -> list[dict]:
        ref = self.db.collection("issues")
        query = ref
        if category:
            query = query.where("category", "==", category)
        if status:
            query = query.where("status", "==", status)
        docs = query.stream()
        return [doc.to_dict() for doc in docs]

    async def update(self, issue_id: str, update_in: IssueUpdate) -> dict | None:
        ref = self.db.collection("issues").document(issue_id)
        doc = ref.get()
        if not doc.exists:
            return None
        data = update_in.model_dump(exclude_unset=True, by_alias=True)
        data["updatedAt"] = datetime.now(timezone.utc).isoformat()
        if update_in.status == "resolved":
            data["resolvedAt"] = data["updatedAt"]
        ref.update(data)
        return ref.get().to_dict()

    async def increment_upvotes(self, issue_id: str) -> int:
        ref = self.db.collection("issues").document(issue_id)
        doc = ref.get()
        if not doc.exists:
            return 0
        current_upvotes = doc.to_dict().get("upvotes", 0)
        new_upvotes = current_upvotes + 1
        ref.update({"upvotes": new_upvotes})
        return new_upvotes

    async def increment_verifications(self, issue_id: str, positive: bool = True) -> int:
        ref = self.db.collection("issues").document(issue_id)
        doc = ref.get()
        if not doc.exists:
            return 0
        current_verifications = doc.to_dict().get("verifications", 0)
        status = doc.to_dict().get("status", "reported")
        if positive:
            new_verifications = current_verifications + 1
            data = {"verifications": new_verifications}
            if new_verifications >= 5 and status == "reported":
                data["status"] = "verified"
        else:
            # Reopen issue
            new_verifications = 0
            data = {"verifications": new_verifications, "status": "in_progress"}
        ref.update(data)
        return new_verifications
