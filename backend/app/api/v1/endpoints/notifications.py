from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.user import CurrentUser

router = APIRouter()

@router.get("/")
async def get_notifications(user: CurrentUser = Depends(get_current_user)):
    return [
        {
            "id": "1",
            "userId": user.uid,
            "title": "Issue Resolved",
            "body": "The pothole you reported at MG Road has been successfully repaired.",
            "type": "status_update",
            "read": False,
            "createdAt": "2026-06-30T10:00:00Z"
        },
        {
            "id": "2",
            "userId": user.uid,
            "title": "Badge Earned!",
            "body": "Congratulations! You earned the 'Community Hero' badge for 5 verifications.",
            "type": "reward",
            "read": True,
            "createdAt": "2026-06-29T15:30:00Z"
        }
    ]