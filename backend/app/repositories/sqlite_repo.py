import json
from datetime import datetime, timezone
from app.core.database import get_db
from app.schemas.user import UserProfile
from app.schemas.issue import IssueCreate, IssueUpdate
from app.repositories.base import BaseUserRepository, BaseIssueRepository

class SQLiteUserRepository(BaseUserRepository):
    async def get_by_uid(self, uid: str) -> UserProfile | None:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE uid = ?", (uid,)).fetchone()
            if not row:
                return None
            data = dict(row)
            try:
                badges = json.loads(data.get("badges") or "[]")
            except Exception:
                badges = []
            return UserProfile(
                uid=data["uid"],
                email=data["email"],
                displayName=data["display_name"],
                role=data["role"],
                photoURL=data["photo_url"],
                points=data["points"],
                badges=badges,
                department=data["department"],
                createdAt=data["created_at"]
            )

    async def get_by_email(self, email: str) -> dict | None:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
            return dict(row) if row else None

    async def get_by_username(self, username: str) -> dict | None:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            return dict(row) if row else None

    async def register(self, username: str, email: str, password_hash: str, display_name: str, role: str) -> UserProfile:
        uid = str(datetime.now().timestamp()) # UUID mock or string
        now = datetime.now(timezone.utc).isoformat()
        badges = ["Welcome Citizen"]
        
        with get_db() as conn:
            conn.execute("""
            INSERT INTO users (uid, email, username, password_hash, display_name, role, points, badges, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (uid, email, username, password_hash, display_name, role, 10, json.dumps(badges), now))
        
        return UserProfile(
            uid=uid,
            email=email,
            displayName=display_name,
            role=role,
            photoURL=None,
            points=10,
            badges=badges,
            department=None,
            createdAt=now
        )

    async def get_leaderboard(self, limit: int) -> list[dict]:
        with get_db() as conn:
            rows = conn.execute("SELECT * FROM users ORDER BY points DESC LIMIT ?", (limit,)).fetchall()
            leaderboard = []
            for rank, row in enumerate(rows, 1):
                data = dict(row)
                try:
                    badges = json.loads(data.get("badges") or "[]")
                except Exception:
                    badges = []
                leaderboard.append({
                    "uid": data["uid"],
                    "displayName": data["display_name"],
                    "photoURL": data["photo_url"],
                    "points": data["points"],
                    "reportsCount": len(badges),
                    "rank": rank
                })
            return leaderboard

class SQLiteIssueRepository(BaseIssueRepository):
    def _parse_row(self, row) -> dict:
        data = dict(row)
        try:
            image_urls = json.loads(data.get("image_urls") or "[]")
        except Exception:
            image_urls = []
        try:
            ai_data = json.loads(data.get("ai")) if data.get("ai") else None
        except Exception:
            ai_data = None
            
        return {
            "id": data["id"],
            "title": data["title"],
            "description": data["description"],
            "category": data["category"],
            "status": data["status"],
            "severity": data["severity"],
            "priorityScore": data["priority_score"],
            "location": {"lat": data["lat"], "lng": data["lng"]},
            "address": data["address"],
            "imageUrls": image_urls,
            "reporterId": data["reporter_id"],
            "reporterName": data["reporter_name"],
            "assignedOfficerId": data["assigned_officer_id"],
            "department": data["department"],
            "ai": ai_data,
            "upvotes": data["upvotes"],
            "verifications": data["verifications"],
            "createdAt": data["created_at"],
            "updatedAt": data["updated_at"],
            "resolvedAt": data["resolved_at"]
        }

    async def create(self, issue_id: str, issue_in: IssueCreate, doc_data: dict) -> dict:
        with get_db() as conn:
            conn.execute("""
            INSERT INTO issues (
                id, title, description, category, status, severity, priority_score,
                lat, lng, address, image_urls, reporter_id, reporter_name,
                assigned_officer_id, department, ai, upvotes, verifications,
                created_at, updated_at, resolved_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                issue_id,
                issue_in.title,
                issue_in.description,
                issue_in.category,
                doc_data["status"],
                doc_data["severity"],
                doc_data["priorityScore"],
                issue_in.location.lat,
                issue_in.location.lng,
                issue_in.address,
                json.dumps(issue_in.image_urls),
                doc_data["reporterId"],
                doc_data["reporterName"],
                None,
                doc_data.get("department"),
                json.dumps(doc_data["ai"]) if doc_data["ai"] else None,
                0,
                0,
                doc_data["createdAt"],
                doc_data["updatedAt"],
                None
            ))
        return doc_data

    async def get(self, issue_id: str) -> dict | None:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM issues WHERE id = ?", (issue_id,)).fetchone()
            return self._parse_row(row) if row else None

    async def list_all(self, category: str | None = None, status: str | None = None) -> list[dict]:
        query = "SELECT * FROM issues WHERE 1=1"
        params = []
        if category:
            query += " AND category = ?"
            params.append(category)
        if status:
            query += " AND status = ?"
            params.append(status)
            
        with get_db() as conn:
            rows = conn.execute(query, params).fetchall()
            return [self._parse_row(r) for r in rows]

    async def update(self, issue_id: str, update_in: IssueUpdate) -> dict | None:
        with get_db() as conn:
            row = conn.execute("SELECT * FROM issues WHERE id = ?", (issue_id,)).fetchone()
            if not row:
                return None
            
            data = update_in.model_dump(exclude_unset=True)
            fields = []
            values = []
            for k, v in data.items():
                if k == "assigned_officer_id":
                    fields.append("assigned_officer_id = ?")
                    values.append(v)
                elif k == "department":
                    fields.append("department = ?")
                    values.append(v)
                elif k == "status":
                    fields.append("status = ?")
                    values.append(v)
                    if v == "resolved":
                        fields.append("resolved_at = ?")
                        values.append(datetime.now(timezone.utc).isoformat())
            
            if fields:
                fields.append("updated_at = ?")
                values.append(datetime.now(timezone.utc).isoformat())
                
                query = f"UPDATE issues SET {', '.join(fields)} WHERE id = ?"
                values.append(issue_id)
                conn.execute(query, values)
            
            updated_row = conn.execute("SELECT * FROM issues WHERE id = ?", (issue_id,)).fetchone()
            return self._parse_row(updated_row)

    async def increment_upvotes(self, issue_id: str) -> int:
        with get_db() as conn:
            row = conn.execute("SELECT upvotes FROM issues WHERE id = ?", (issue_id,)).fetchone()
            if not row:
                return 0
            new_upvotes = row["upvotes"] + 1
            conn.execute("UPDATE issues SET upvotes = ? WHERE id = ?", (new_upvotes, issue_id))
            return new_upvotes

    async def increment_verifications(self, issue_id: str, positive: bool = True) -> int:
        with get_db() as conn:
            row = conn.execute("SELECT verifications, status FROM issues WHERE id = ?", (issue_id,)).fetchone()
            if not row:
                return 0
            new_verifications = row["verifications"]
            status = row["status"]
            if positive:
                new_verifications += 1
                if status == "reported" and new_verifications >= 5:
                    status = "verified"
            else:
                # If citizen flags verification failed, reopen task
                status = "in_progress"
                new_verifications = 0
            conn.execute("UPDATE issues SET verifications = ?, status = ? WHERE id = ?", (new_verifications, status, issue_id))
            return new_verifications
