from typing import Annotated, Callable
from fastapi import Depends, Header, Request
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import has_required_role, decode_access_token
from app.schemas.user import CurrentUser
from app.services.user_service import UserService, get_user_service

async def get_current_user(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
    user_service: UserService = Depends(get_user_service),
) -> CurrentUser:
    """FastAPI dependency to extract JWT from Authorization header and resolve User profile."""
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header")

    token = authorization.split(" ", 1)[1]
    
    # Dual-mode authentication (Firebase Auth in Prod, local JWT in Dev)
    from app.core.config import settings
    if settings.db_provider == "firestore":
        from app.core.firebase import get_auth
        try:
            auth = get_auth()
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get("uid") or decoded_token.get("sub")
        except Exception as exc:
            raise UnauthorizedError(f"Invalid Firebase ID token: {str(exc)}")
    else:
        claims = decode_access_token(token)
        uid = claims.get("sub") or claims.get("uid")

    if not uid:
        raise UnauthorizedError("Token does not contain subject claim")

    profile = await user_service.get_user_by_uid(uid)
    if not profile:
        raise UnauthorizedError("User session not found or deleted")
        
    request.state.user_uid = uid
    return CurrentUser(**profile.model_dump())

def require_role(required: str) -> Callable:
    """Enforces role hierarchy (e.g. requires officer role or higher)."""
    async def _checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if not has_required_role(user.role, required):
            raise ForbiddenError(f"Requires '{required}' role or higher")
        return user
    return _checker