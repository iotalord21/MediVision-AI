from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

import app.database.mongodb as mongodb_module
from app.auth.hashing import hash_password, verify_password
from app.schemas.user import UserRegister


def format_user_response(user_doc: dict) -> dict:
    """Format MongoDB user document into a response-friendly dictionary."""
    created = user_doc.get("created_at")
    updated = user_doc.get("updated_at")

    if isinstance(created, datetime):
        created = created.isoformat()
    if isinstance(updated, datetime):
        updated = updated.isoformat()

    return {
        "id": str(user_doc["_id"]),
        "full_name": user_doc.get("full_name", ""),
        "email": user_doc.get("email", ""),
        "created_at": created or datetime.now(timezone.utc).isoformat(),
        "updated_at": updated or datetime.now(timezone.utc).isoformat(),
    }


async def register_user(user_in: UserRegister) -> dict:
    """Register a new user in MongoDB."""
    db = mongodb_module.db
    email_lower = user_in.email.lower()

    # Check existing user
    existing_user = await db.users.find_one({"email": email_lower})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    hashed_pw = hash_password(user_in.password)
    now = datetime.now(timezone.utc)

    user_doc = {
        "full_name": user_in.full_name,
        "email": email_lower,
        "password": hashed_pw,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return format_user_response(user_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate email and password against stored user credentials."""
    db = mongodb_module.db
    email_lower = email.lower()
    user = await db.users.find_one({"email": email_lower})
    if not user:
        return None

    if not verify_password(password, user["password"]):
        return None

    return format_user_response(user)


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Fetch user by ID string or ObjectId."""
    db = mongodb_module.db
    query = []
    if ObjectId.is_valid(user_id):
        query.append({"_id": ObjectId(user_id)})
    query.append({"_id": str(user_id)})

    user = await db.users.find_one({"$or": query})
    if not user:
        return None

    return format_user_response(user)
