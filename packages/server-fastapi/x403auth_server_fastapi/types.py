"""
Types for FastAPI server library
"""

from typing import Optional, Callable, Awaitable
from solders.pubkey import Pubkey


class AuthPluginOptions:
    """Options for authentication middleware"""

    def __init__(
        self,
        challenge_expiry: int = 60000,  # Default 60 seconds
        gate_check: Optional[Callable[[Pubkey], Awaitable[bool]]] = None,
        generate_nonce: Optional[Callable[[], str]] = None,
    ):
        self.challenge_expiry = challenge_expiry
        self.gate_check = gate_check
        self.generate_nonce = generate_nonce


class ChallengeData:
    """Challenge data for client"""

    def __init__(self, challenge: str, nonce: str, expires_at: int, expires_in: int):
        self.challenge = challenge
        self.nonce = nonce
        self.expires_at = expires_at
        self.expires_in = expires_in

    def to_dict(self) -> dict:
        return {
            "challenge": self.challenge,
            "nonce": self.nonce,
            "expiresAt": self.expires_at,
            "expiresIn": self.expires_in,
        }


class AuthState:
    """User authentication state"""

    def __init__(self, wallet: str, public_key: Pubkey):
        self.wallet = wallet
        self.public_key = public_key

