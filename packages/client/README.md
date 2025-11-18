# @403xauth/client

Client library for 403xAuth - stateless Web3 authentication via Solana.

## Installation

```bash
npm install @403xauth/client
```

## Usage

### In Browser

```javascript
import { AuthClient } from '@403xauth/client';

// Use browser wallet (Phantom, Backpack, Solflare)
const client = new AuthClient({
  wallet: window.solana, // or window.backpack, window.solflare
  baseURL: 'https://api.example.com',
});

// Connect wallet
await client.connect();

// Make request - library automatically handles 403 and signs challenge
const response = await client.get('/api/profile');
const data = await response.json();
```

### In Node.js

```javascript
import { AuthClient } from '@403xauth/client';
import { Keypair } from '@solana/web3.js';

// Create or load keypair
const keypair = Keypair.generate();

const client = new AuthClient({
  wallet: keypair,
  baseURL: 'https://api.example.com',
});

// Make request
const response = await client.get('/api/profile');
```

## API

### `new AuthClient(config)`

Creates a new client instance.

**Parameters:**
- `config.wallet` - Browser wallet or Solana Keypair
- `config.baseURL` - Base API URL (optional)
- `config.timeout` - Request timeout in milliseconds (default: 30000)

### `client.fetch(url, init)`

Makes a request with automatic authentication handling.

### `client.get(url, init)`

Makes a GET request.

### `client.post(url, body, init)`

Makes a POST request.

### `client.put(url, body, init)`

Makes a PUT request.

### `client.delete(url, init)`

Makes a DELETE request.

### `client.connect()`

Connects browser wallet (if required).

### `client.getPublicKey()`

Returns the public key of the current wallet.

### `client.isConnected()`

Checks if wallet is connected.

## License

MIT

