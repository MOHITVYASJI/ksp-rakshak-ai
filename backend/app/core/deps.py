from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.domain import Officer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Officer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(Officer).filter(Officer.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_clearance(min_level: int):
    """Enforces minimum RBAC clearance level on endpoints."""
    def clearance_checker(current_user: Officer = Depends(get_current_user)):
        if current_user.clearance_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient clearance. Minimum clearance level {min_level} required."
            )
        return current_user
    return clearance_checker

def anonymize_sensitive_record(data_dict: dict, user_clearance: int) -> dict:
    """Anonymizes victim PII for sensitive cases (POCSO/Sexual Assault) if clearance level < 3."""
    if data_dict.get("is_sensitive") and user_clearance < 3:
        if "victims_list" in data_dict:
            for v in data_dict["victims_list"]:
                v["name"] = "PROTECTED_VICTIM_IDENTITY (POCSO/SENSITIVE)"
                v["phone_number"] = "XXXXXXXXXX"
                v["address"] = "PROTECTED_ADDRESS"
    return data_dict
