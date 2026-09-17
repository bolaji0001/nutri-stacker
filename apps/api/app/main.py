import truststore

# Use the operating system's trusted certificate authorities for every
# outbound HTTPS client (Supabase, Groq, PyJWT). This must run before the
# routers import services that construct those clients.
truststore.inject_into_ssl()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, plans, profile

app = FastAPI(title="Nutri-Stacker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(profile.router)
app.include_router(plans.router)
