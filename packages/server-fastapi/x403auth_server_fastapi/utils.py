"""
Utilities for FastAPI server library
"""

import base64
import secrets
from solders.pubkey import Pubkey
from nacl.signing import VerifyKey


def generate_nonce() -> str:
    """Generates random nonce"""
    return base64.b64encode(secrets.token_bytes(32)).decode("utf-8")


def create_challenge_string(
    method: str, path: str, challenge: str, nonce: str
) -> str:
    """Creates challenge string for signing"""
    return f"{method}\n{path}\n{challenge}\n{nonce}"


def decode_base64(data: str) -> bytes:
    """Decodes base64 string to bytes"""
    return base64.b64decode(data)


def verify_signature(
    public_key: Pubkey, message: bytes, signature: bytes
) -> bool:
    """Verifies Solana signature"""
    try:
        verify_key = VerifyKey(bytes(public_key))
        verify_key.verify(message, signature)
        return True
    except Exception:
        return False


def encode_message(message: str) -> bytes:
    """Encodes string to bytes"""
    return message.encode("utf-8")

