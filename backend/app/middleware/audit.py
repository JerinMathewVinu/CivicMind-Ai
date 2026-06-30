import time
import uuid
from datetime import datetime, timezone
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.firebase import get_firestore
from app.core.logging import get_logger

log = get_logger("audit")
_MUTATING = {"POST", "PUT", "PATCH", "DELETE"}

class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        request.state.request_id = request_id

        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        log.info(
            "request",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms,
        )

        if request.method in _MUTATING and response.status_code < 400:
            try:
                get_firestore().collection("audit_logs").document(request_id).set(
                    {
                        "requestId": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "status": response.status_code,
                        "durationMs": duration_ms,
                        "actor": getattr(request.state, "user_uid", "anonymous"),
                        "createdAt": datetime.now(timezone.utc).isoformat(),
                    }
                )
            except Exception as exc:
                log.warning("audit_persist_failed", error=str(exc))

        response.headers["X-Request-ID"] = request_id
        return response