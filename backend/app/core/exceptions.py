from fastapi import FastAPI, Request, status
from fastapi.responses import ORJSONResponse
from app.core.logging import get_logger

log = get_logger("exceptions")

class AppError(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class NotFoundError(AppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class ForbiddenError(AppError):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class AIServiceError(AppError):
    def __init__(self, message: str = "AI service failure"):
        super().__init__(message, status.HTTP_502_BAD_GATEWAY)

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> ORJSONResponse:
        log.warning("app_error", message=exc.message, status=exc.status_code)
        return ORJSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message, "error": exc.__class__.__name__},
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(_: Request, exc: Exception) -> ORJSONResponse:
        log.error("unhandled_error", error=str(exc))
        return ORJSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": "InternalError"},
        )