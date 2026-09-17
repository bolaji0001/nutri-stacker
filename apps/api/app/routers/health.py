from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "nutri-stacker-api",
        "supabase": settings.supabase_configured,
        "groq": bool(settings.groq_api_key),
    }
