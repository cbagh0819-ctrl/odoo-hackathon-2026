import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import (
    UserRegister, UserLogin, UserOut, PasswordResetRequest, PasswordResetConfirm
)
from ..auth import hash_password, verify_password, create_access_token, get_current_user, require_role

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Public registration only creates customer accounts
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role="customer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@router.post("/create-staff", response_model=UserOut)
def create_staff(
    user_in: UserRegister,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    """Only the Admin can create a new member of staff (Per PDF requirement)."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    staff_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role="staff"
    )
    db.add(staff_user)
    db.commit()
    db.refresh(staff_user)
    return staff_user

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Return success anyway to avoid user enumeration
        return {"message": "If that email exists, a password reset link has been dispatched."}

    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    db.commit()

    # Per PDF: "a reset link should arrive at their registered email"
    reset_link = f"/reset-password?token={reset_token}"
    return {
        "message": "Reset link sent to registered email.",
        "simulated_email_link": reset_link,
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user.password_hash = hash_password(req.new_password)
    user.reset_token = None
    db.commit()
    return {"message": "Password updated successfully. You can now log in."}

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/customers", response_model=list[UserOut])
def get_customers(
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_role(["admin", "staff"]))
):
    return db.query(User).filter(User.role == "customer").all()

@router.get("/staff", response_model=list[UserOut])
def get_staff_members(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    return db.query(User).filter(User.role == "staff").all()
