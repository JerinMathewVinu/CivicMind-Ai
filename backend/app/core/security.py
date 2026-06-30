import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt
from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.core.logging import get_logger

log = get_logger("security")
ROLE_RANK: dict[str, int] = {"citizen": 1, "officer": 2, "admin": 3, "super_admin": 4}

def get_password_hash(password: str) -> str:
    """Hash password using PBKDF2 with a secure random salt."""
    salt = secrets.token_hex(16)
    iterations = 100000
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    )
    return f"pbkdf2_sha256${iterations}${salt}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password by rebuilding the PBKDF2 hash using stored salt and iterations."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
            
        iterations = int(parts[1])
        salt = parts[2]
        stored_hash = parts[3]
        
        dk = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        )
        return dk.hex() == stored_hash
    except Exception as exc:
        log.warning("password_verification_failed", error=str(exc))
        return False

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Generate a JWT token with an expiration time."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify the signature and expiry of a JWT token."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except Exception as exc:
        log.warning("token_decoding_failed", error=str(exc))
        raise UnauthorizedError("Invalid or expired authentication token") from exc

def has_required_role(user_role: str, required_role: str) -> bool:
    return ROLE_RANK.get(user_role, 0) >= ROLE_RANK.get(required_role, 99)