"""
403xAuth FastAPI Middleware

Stateless Web3 authentication for Solana applications via FastAPI.
"""

from .middleware import auth_middleware, AuthState
from .types import AuthPluginOptions, ChallengeData

__version__ = "1.0.0"
__all__ = ["auth_middleware", "AuthState", "AuthPluginOptions", "ChallengeData"]

