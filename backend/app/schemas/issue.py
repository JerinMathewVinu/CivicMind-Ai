from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field

IssueCategory = Literal[
    "pothole", "garbage", "water_leakage", "streetlight", "road_crack",
    "drainage", "traffic_signal", "illegal_dumping", "tree_fallen",
    "flooding", "public_infrastructure"
]

IssueStatus = Literal[
    "reported", "ai_triaged", "assigned", "in_progress", "resolved", "verified", "rejected", "duplicate"
]

Severity = Literal["low", "medium", "high", "critical"]

class GeoPoint(BaseModel):
    lat: float
    lng: float

class AIAnalysis(BaseModel):
    category: IssueCategory
    category_confidence: float = Field(alias="categoryConfidence")
    severity: Severity
    severity_score: float = Field(alias="severityScore")
    priority_score: float = Field(alias="priorityScore")
    is_duplicate: bool = Field(alias="isDuplicate")
    duplicate_of: str | None = Field(default=None, alias="duplicateOf")
    tags: list[str] = Field(default_factory=list)
    summary: str
    recommended_action: str = Field(alias="recommendedAction")
    estimated_repair_days: int = Field(alias="estimatedRepairDays")

    # Hackathon Agentic AI extensions
    predictions: dict | None = Field(default=None, alias="predictions")
    repair_checklist: list[str] | None = Field(default=None, alias="repairChecklist")
    department: str | None = Field(default=None, alias="department")

    model_config = {"populate_by_name": True}

class IssueCreate(BaseModel):
    title: str
    description: str
    category: IssueCategory
    location: GeoPoint
    address: str
    image_urls: list[str] = Field(default_factory=list, alias="imageUrls")

class IssueUpdate(BaseModel):
    status: IssueStatus | None = None
    assigned_officer_id: str | None = Field(default=None, alias="assignedOfficerId")
    department: str | None = None

class IssueResponse(BaseModel):
    id: str
    title: str
    description: str
    category: IssueCategory
    status: IssueStatus
    severity: Severity
    priority_score: float = Field(alias="priorityScore")
    location: GeoPoint
    address: str
    image_urls: list[str] = Field(alias="imageUrls")
    reporter_id: str = Field(alias="reporterId")
    reporter_name: str = Field(alias="reporterName")
    assigned_officer_id: str | None = Field(default=None, alias="assignedOfficerId")
    department: str | None = None
    ai: AIAnalysis | None = None
    upvotes: int = 0
    verifications: int = 0
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    resolved_at: str | None = Field(default=None, alias="resolvedAt")

    model_config = {"populate_by_name": True}