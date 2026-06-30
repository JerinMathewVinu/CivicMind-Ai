from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import require_role
from app.schemas.user import CurrentUser
from app.schemas.issue import AIAnalysis
from app.services.gemini_service import GeminiService, get_gemini_service

router = APIRouter()

@router.post("/analyze", response_model=AIAnalysis)
async def analyze_report(
    title: str,
    description: str,
    image_urls: list[str] = [],
    user: CurrentUser = Depends(require_role("citizen")),
    service: GeminiService = Depends(get_gemini_service)
):
    try:
        return await service.analyze_issue(title, description, image_urls)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI Service error: {str(exc)}")