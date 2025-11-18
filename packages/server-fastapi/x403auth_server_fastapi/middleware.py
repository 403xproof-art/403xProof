"""
FastAPI middleware for 403xAuth
"""

import json
from typing import Callable, Optional
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from solders.pubkey import Pubkey
from solders import pubkey

from .types import AuthPluginOptions, ChallengeData, AuthState
from .utils import (
    generate_nonce,
    create_challenge_string,
    decode_base64,
    verify_signature,
    encode_message,
)


def auth_middleware(options: Optional[AuthPluginOptions] = None) -> Callable:
    """
    Creates middleware for authentication via 403xAuth protocol

    Args:
        options: Middleware configuration options

    Returns:
        Middleware function for FastAPI
    """
    if options is None:
        options = AuthPluginOptions()

    challenge_expiry = options.challenge_expiry or 60000
    gate_check = options.gate_check
    custom_generate_nonce = options.generate_nonce or generate_nonce

    async def send_challenge(request: Request) -> JSONResponse:
        """Sends challenge to client"""
        nonce = custom_generate_nonce()
        challenge = nonce

        import time
        timestamp = int(time.time() * 1000)
        challenge_data = ChallengeData(
            challenge=challenge,
            nonce=nonce,
            expires_at=timestamp + challenge_expiry,
            expires_in=challenge_expiry,
        )

        return JSONResponse(
            status_code=403,
            content=challenge_data.to_dict(),
        )

    async def middleware_func(request: Request, call_next: Callable) -> Response:
        """Main middleware function"""
        # Extract authentication headers
        wallet_header = request.headers.get("x-auth-wallet")
        signature_header = request.headers.get("x-auth-signature")
        challenge_header = request.headers.get("x-auth-challenge")
        method_header = request.headers.get("x-auth-method")
        path_header = request.headers.get("x-auth-path")

        # If headers are missing, return challenge
        if not wallet_header or not signature_header or not challenge_header:
            return await send_challenge(request)

        try:
            # Validate headers
            if not method_header or not path_header:
                raise HTTPException(
                    status_code=400, detail="Missing required headers"
                )

            # Check that method and path match
            current_method = request.method.upper()
            current_path = request.url.path
            query_string = str(request.url.query)
            full_path = current_path + ("?" + query_string if query_string else "")

            if method_header != current_method or path_header != full_path:
                return await send_challenge(request)

            # Parse public key
            try:
                public_key = Pubkey.from_string(wallet_header)
            except Exception:
                raise HTTPException(
                    status_code=400, detail="Invalid public key format"
                )

            # Restore challenge
            challenge = challenge_header
            nonce = challenge

            # Create string for signature verification
            challenge_string = create_challenge_string(
                current_method, full_path, challenge, nonce
            )
            message = encode_message(challenge_string)

            # Decode signature
            try:
                signature = decode_base64(signature_header)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid signature format")

            # Verify signature
            is_valid = verify_signature(public_key, message, signature)
            if not is_valid:
                raise HTTPException(status_code=401, detail="Invalid signature")

            # Check NFT/SPL gates
            if gate_check:
                has_access = await gate_check(public_key)
                if not has_access:
                    raise HTTPException(
                        status_code=403,
                        detail="Access denied: gate conditions not met",
                    )

            # Add user information to request state
            request.state.auth = AuthState(
                wallet=wallet_header, public_key=public_key
            )

            # Continue request processing
            response = await call_next(request)
            return response

        except HTTPException:
            raise
        except Exception as e:
            return JSONResponse(
                status_code=500, content={"error": "Internal server error"}
            )

    return middleware_func

