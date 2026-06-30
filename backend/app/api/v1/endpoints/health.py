from fastapi import APIRouter
from app.core.config import settings
from app.core.firebase import get_firestore

router = APIRouter()

@router.get("/live")
async def liveness() -> dict[str, str]:
    return {"status": "alive", "app": settings.app_name}

@router.get("/ready")
async def readiness() -> dict[str, str]:
    try:
        get_firestore().collection("_health").document("ping").set({"ok": True})
        return {"status": "ready"}
    except Exception:
        return {"status": "degraded", "detail": "Firestore connectivity unavailable"}