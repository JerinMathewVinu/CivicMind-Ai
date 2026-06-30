from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user, require_role
from app.schemas.user import CurrentUser
from app.schemas.issue import IssueCreate, IssueResponse, IssueUpdate
from app.services.issue_service import IssueService, get_issue_service

router = APIRouter()

@router.post("/", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def report_issue(
    issue_in: IssueCreate,
    user: CurrentUser = Depends(get_current_user),
    service: IssueService = Depends(get_issue_service)
):
    issue_data = await service.create_issue(issue_in, user.uid, user.display_name)
    return IssueResponse(**issue_data)

@router.get("/", response_model=list[IssueResponse])
async def list_issues(
    category: str | None = None,
    status: str | None = None,
    service: IssueService = Depends(get_issue_service)
):
    issues = await service.list_issues(category, status)
    return [IssueResponse(**i) for i in issues]

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str, service: IssueService = Depends(get_issue_service)):
    issue = await service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return IssueResponse(**issue)

@router.patch("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: str,
    update_in: IssueUpdate,
    user: CurrentUser = Depends(require_role("officer")),
    service: IssueService = Depends(get_issue_service)
):
    updated = await service.update_issue(issue_id, update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Issue not found")
    return IssueResponse(**updated)

@router.post("/{issue_id}/upvote", response_model=dict)
async def upvote_issue(
    issue_id: str,
    user: CurrentUser = Depends(get_current_user),
    service: IssueService = Depends(get_issue_service)
):
    new_upvotes = await service.upvote_issue(issue_id)
    return {"upvotes": new_upvotes}

@router.post("/{issue_id}/verify", response_model=dict)
async def verify_issue(
    issue_id: str,
    positive: bool = True,
    user: CurrentUser = Depends(get_current_user),
    service: IssueService = Depends(get_issue_service)
):
    new_verifications = await service.verify_issue(issue_id, positive)
    return {"verifications": new_verifications}