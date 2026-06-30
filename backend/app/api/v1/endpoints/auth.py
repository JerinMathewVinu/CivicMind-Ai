from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.schemas.user import CurrentUser, UserProfile, UserRegister, UserLogin, TokenResponse
from app.services.user_service import UserService, get_user_service
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register(
    register_in: UserRegister,
    service: UserService = Depends(get_user_service)
):
    """Registers a new citizen user, validates uniqueness, and hashes password."""
    # Check duplicate email
    existing_email = await service.get_user_by_email(register_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # Check duplicate username
    existing_username = await service.get_user_by_username(register_in.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )
        
    # Hash password and save
    pw_hash = get_password_hash(register_in.password)
    user_profile = await service.register_user(
        username=register_in.username,
        email=register_in.email,
        password_hash=pw_hash,
        display_name=register_in.displayName,
        role="citizen"
    )
    return user_profile

@router.post("/login", response_model=TokenResponse)
async def login(
    login_in: UserLogin,
    service: UserService = Depends(get_user_service)
):
    """Authenticates credentials and returns a JWT access token."""
    # Find user (supports email or username login)
    user_record = None
    if "@" in login_in.username:
        user_record = await service.get_user_by_email(login_in.username)
    else:
        user_record = await service.get_user_by_username(login_in.username)
        
    if not user_record or not verify_password(login_in.password, user_record["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )
        
    # Generate stateless session JWT token (stores user UUID as subject claim)
    access_token = create_access_token(data={"sub": user_record["uid"]})
    
    # Fetch full profile representation
    profile = await service.get_user_by_uid(user_record["uid"])
    return TokenResponse(
        accessToken=access_token,
        tokenType="bearer",
        user=profile
    )

@router.post("/verify-token", response_model=UserProfile)
async def verify_token(user: CurrentUser = Depends(get_current_user)):
    """Validates the JWT access token and returns the current user profile."""
    return user