"""
Example of using the server library with FastAPI
"""

from fastapi import FastAPI, Request
from x403auth_server_fastapi import auth_middleware, AuthPluginOptions
from solders.pubkey import Pubkey


# Example NFT gate check function
async def check_nft_gate(public_key: Pubkey) -> bool:
    """
    Checks NFT or SPL token ownership
    
    You can add logic here to check via RPC requests to Solana
    """
    # Simplified example - always returns True
    return True


# Create FastAPI application
app = FastAPI()

# Configure middleware options
options = AuthPluginOptions(
    challenge_expiry=60000,  # 60 seconds
    gate_check=check_nft_gate,  # Optional
)

# Apply middleware
app.middleware("http")(auth_middleware(options))


@app.get("/api/profile")
async def profile(request: Request):
    """
    Protected route - requires authentication
    """
    # User information available in request.state.auth
    auth = request.state.auth
    return {
        "wallet": auth.wallet,
        "public_key": str(auth.public_key),
        "message": "Access granted!",
    }


@app.get("/api/public")
async def public_route():
    """
    Public route - does not require authentication
    """
    return {"message": "This is a public route"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

