from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field

UserRole = Literal["citizen", "officer", "admin", "super_admin"]

class UserProfile(BaseModel):
    uid: str
    email: str
    display_name: str = Field(alias="displayName")
    role: UserRole = "citizen"
    photo_url: str | None = Field(default=None, alias="photoURL")
    points: int = 0
    badges: list[str] = Field(default_factory=list)
    department: str | None = None
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        alias="createdAt",
    )

    model_config = {"populate_by_name": True}

class CurrentUser(UserProfile):
    pass

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    displayName: str = Field(alias="displayName")

    model_config = {"populate_by_name": True}

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(alias="tokenType")
    user: UserProfile

    model_config = {"populate_by_name": True}