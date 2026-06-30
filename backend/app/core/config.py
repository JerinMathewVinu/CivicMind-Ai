from functools import lru_cache
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_env: Literal["development", "staging", "production"] = "development"
    app_name: str = "CivicMind AI"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"

    firebase_project_id: str = Field(default="civicmind-ai", alias="FIREBASE_PROJECT_ID")
    firebase_storage_bucket: str = Field(default="civicmind-ai.appspot.com", alias="FIREBASE_STORAGE_BUCKET")
    google_application_credentials: str | None = Field(default=None, alias="GOOGLE_APPLICATION_CREDENTIALS")

    gemini_api_key: str = Field(default="your_gemini_api_key", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL")

    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    rate_limit_per_minute: int = Field(default=120, alias="RATE_LIMIT_PER_MINUTE")

    # JWT Settings
    jwt_secret_key: str = Field(default="super_secret_civic_key_12345", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Database Settings
    db_provider: Literal["sqlite", "firestore"] = Field(default="sqlite", alias="DB_PROVIDER")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()