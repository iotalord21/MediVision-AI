from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.jwt_handler import decode_access_token
from app.auth.auth_service import get_user_by_id

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency to get current authenticated user from Bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = await get_user_by_id(user_id)
    if not user:
        raise credentials_exception

    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
) -> Optional[dict]:
    """Dependency for optional user authentication without raising 401/403."""
    if not credentials:
        return None

    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload:
            return None

        user_id: str = payload.get("sub")
        if not user_id:
            return None

        return await get_user_by_id(user_id)
    except Exception:
        return None
