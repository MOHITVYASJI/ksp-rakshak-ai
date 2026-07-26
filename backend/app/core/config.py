import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KSP RAKSHAK-AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ksp_datathon_2026_super_secret_rakshak_key_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    FAST_MODEL: str = "llama-3.1-8b-instant"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ksp_rakshak.db")
    AUDIT_SALT: str = os.getenv("AUDIT_SALT", "ksp_audit_sha256_salt_2026")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
