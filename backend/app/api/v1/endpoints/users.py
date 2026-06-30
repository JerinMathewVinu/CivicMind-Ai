from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.user import CurrentUser, UserProfile
from app.services.user_service import UserService, get_user_service

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_me(user: CurrentUser = Depends(get_current_user)):
    return user

@router.get("/leaderboard", response_model=list[dict])
async def get_leaderboard(limit: int = 10, service: UserService = Depends(get_user_service)):
    return await service.get_leaderboard(limit)