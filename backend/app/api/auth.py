from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.auth.auth_service import register_user, authenticate_user
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user"
)
async def register(user_in: UserRegister):
    """Register a new user with full_name, email, and password."""
    user = await register_user(user_in)
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and return JWT access token"
)
async def login(credentials: UserLogin):
    """Authenticate user with email and password."""
    user = await authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile"
)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve profile of the currently logged in user."""
    return UserResponse(**current_user)
