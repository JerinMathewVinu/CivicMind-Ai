from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.database import init_db
from app.core.logging import configure_logging, get_logger
from app.middleware.audit import AuditLogMiddleware

configure_logging()
log = get_logger("main")

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])

@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    log.info("startup_complete", app=settings.app_name, env=settings.app_env)
    yield
    log.info("shutdown_complete")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="AI Smart City Civic Intelligence",
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, lambda r, e: ORJSONResponse(status_code=429, content={"detail": f"Rate limit exceeded: {e.detail}"}))
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(AuditLogMiddleware)
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    register_exception_handlers(app)
    return app

app = create_app()