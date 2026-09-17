from supabase import Client, create_client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if not settings.supabase_configured:
        raise RuntimeError("Supabase is not configured. Copy apps/api/.env.example to .env.")
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client
