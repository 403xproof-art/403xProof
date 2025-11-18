# x403auth-server-fastapi

FastAPI middleware for 403xAuth - stateless Web3 authentication via Solana.

## Installation

```bash
pip install x403auth-server-fastapi
```

## Usage

```python
from fastapi import FastAPI, Request
from x403auth_server_fastapi import auth_middleware

app = FastAPI()

# Apply middleware to all routes
app.middleware("http")(auth_middleware())

@app.get("/api/profile")
async def profile(request: Request):
    # Access user information
    auth = request.state.auth
    return {"wallet": auth.wallet}
```

## Configuration Options

```python
from x403auth_server_fastapi import AuthPluginOptions

options = AuthPluginOptions(
    challenge_expiry=60000,  # Challenge lifetime in milliseconds
    gate_check=check_nft_access,  # NFT/SPL token check function
)

app.middleware("http")(auth_middleware(options))
```

## License

MIT

