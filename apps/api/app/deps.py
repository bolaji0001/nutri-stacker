import logging
import ssl
from typing import Annotated

import jwt
import truststore
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidAlgorithmError, PyJWKClient

from app.config import settings

logger = logging.getLogger(__name__)
_bearer = HTTPBearer(auto_error=False)
_jwks_client: PyJWKClient | None = None
ASYMMETRIC_ALGORITHMS = ("ES256", "RS256")


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        # Python's bundled CA verifier can reject certificates installed by
        # corporate proxies or antivirus software on Windows. Use the native
        # OS trust store without disabling TLS verification.
        ssl_context = truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        _jwks_client = PyJWKClient(
            f"{settings.supabase_url}/auth/v1/.well-known/jwks.json",
            ssl_context=ssl_context,
        )
    return _jwks_client


def decode_access_token(token: str) -> dict:
    algorithm = jwt.get_unverified_header(token).get("alg")
    issuer = f"{settings.supabase_url}/auth/v1"

    if algorithm in ASYMMETRIC_ALGORITHMS:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            signing_key,
            algorithms=list(ASYMMETRIC_ALGORITHMS),
            audience="authenticated",
            issuer=issuer,
        )

    if algorithm == "HS256":
        if not settings.supabase_jwt_secret:
            raise RuntimeError("SUPABASE_JWT_SECRET is required for HS256 tokens")
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=issuer,
        )

    raise InvalidAlgorithmError(f"Unsupported JWT algorithm: {algorithm}")


def get_current_user_id(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> str:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing access token")
    if not settings.supabase_url:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase is not configured")
    try:
        payload = decode_access_token(creds.credentials)
    except Exception as exc:
        logger.warning("Supabase access-token validation failed: %s: %s", type(exc).__name__, exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from exc
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is missing sub")
    return str(user_id)


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
