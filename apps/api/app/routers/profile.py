from fastapi import APIRouter, HTTPException, status

from app.deps import CurrentUserId
from app.schemas.meal import Profile, ProfileUpdate
from app.supabase_client import get_supabase

router = APIRouter(prefix="/me", tags=["profile"])


@router.get("/profile", response_model=Profile)
def get_profile(user_id: CurrentUserId) -> Profile:
    result = get_supabase().table("profiles").select("*").eq("id", user_id).execute()
    if not result.data:
        created = get_supabase().table("profiles").insert({"id": user_id}).execute()
        return Profile.model_validate(created.data[0])
    return Profile.model_validate(result.data[0])


@router.put("/profile", response_model=Profile)
def update_profile(user_id: CurrentUserId, body: ProfileUpdate) -> Profile:
    payload = body.model_dump(exclude_none=True)
    result = get_supabase().table("profiles").update(payload).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return Profile.model_validate(result.data[0])
