import json
import os
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from app.core.auth import create_access_token, get_current_user, hash_password, verify_password
from app.core.database import supabase

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"


class AuthRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None


class ProfileUpdate(BaseModel):
    full_name: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, str]


def serialize_user(user: dict) -> dict[str, str]:
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user.get("full_name") or "",
        "avatar_url": user.get("avatar_url") or "",
        "auth_provider": user.get("auth_provider") or "password",
    }


@router.post("/register", response_model=AuthResponse)
async def register(payload: AuthRequest):
    email = payload.email.strip().lower()
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters")

    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="An account already exists for this email")

    response = supabase.table("users").insert(
        {
            "email": email,
            "password_hash": hash_password(payload.password),
            "full_name": (payload.full_name or email.split("@")[0]).strip(),
            "auth_provider": "password",
        }
    ).execute()

    user = response.data[0]
    access_token = create_access_token(subject=user["id"], email=user["email"])
    return {"access_token": access_token, "user": serialize_user(user)}


@router.post("/login", response_model=AuthResponse)
async def login(payload: AuthRequest):
    email = payload.email.strip().lower()
    response = supabase.table("users").select("id,email,password_hash").eq("email", email).execute()

    if not response.data or not verify_password(payload.password, response.data[0]["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user = response.data[0]
    access_token = create_access_token(subject=user["id"], email=user["email"])
    return {"access_token": access_token, "user": serialize_user(user)}


@router.get("/me")
async def me(current_user: dict[str, str] = Depends(get_current_user)):
    return current_user


@router.put("/profile")
async def update_profile(payload: ProfileUpdate, current_user: dict[str, str] = Depends(get_current_user)):
    full_name = payload.full_name.strip()
    if not full_name:
        raise HTTPException(status_code=400, detail="Name is required")

    response = (
        supabase.table("users")
        .update({"full_name": full_name})
        .eq("id", current_user["id"])
        .execute()
    )
    return serialize_user(response.data[0])


@router.get("/google/login")
async def google_login(next: str = "/dashboard"):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")

    params = urllib.parse.urlencode(
        {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
            "state": next,
        }
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


@router.get("/google/callback")
async def google_callback(code: str, state: str = "/dashboard"):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")

    token_payload = urllib.parse.urlencode(
        {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
    ).encode("utf-8")

    token_request = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    with urllib.request.urlopen(token_request) as token_response:
        token_data = json.loads(token_response.read().decode("utf-8"))

    user_request = urllib.request.Request(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {token_data['access_token']}"},
    )

    with urllib.request.urlopen(user_request) as user_response:
        profile = json.loads(user_response.read().decode("utf-8"))

    email = profile["email"].strip().lower()
    existing = supabase.table("users").select("*").eq("email", email).execute()

    if existing.data:
        user = existing.data[0]
        update_response = (
            supabase.table("users")
            .update(
                {
                    "full_name": profile.get("name") or user.get("full_name") or email.split("@")[0],
                    "avatar_url": profile.get("picture") or user.get("avatar_url"),
                    "auth_provider": "google",
                }
            )
            .eq("id", user["id"])
            .execute()
        )
        user = update_response.data[0]
    else:
        create_response = (
            supabase.table("users")
            .insert(
                {
                    "email": email,
                    "password_hash": "oauth:google",
                    "full_name": profile.get("name") or email.split("@")[0],
                    "avatar_url": profile.get("picture") or "",
                    "auth_provider": "google",
                }
            )
            .execute()
        )
        user = create_response.data[0]

    access_token = create_access_token(subject=user["id"], email=user["email"])
    user_json = json.dumps(serialize_user(user))
    token_json = json.dumps(access_token)
    destination = state if state.startswith("/") else "/dashboard"

    return HTMLResponse(
        f"""
        <!doctype html>
        <html>
          <body>
            <script>
              localStorage.setItem('llmops_token', {token_json});
              localStorage.setItem('llmops_user', JSON.stringify({user_json}));
              window.location.replace({json.dumps(FRONTEND_URL + destination)});
            </script>
          </body>
        </html>
        """
    )
