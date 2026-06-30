from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, issues, ai, analytics, notifications

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(issues.router, prefix="/issues", tags=["Issues"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])