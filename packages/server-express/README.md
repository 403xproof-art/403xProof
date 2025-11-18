# @403xauth/server-express

Express middleware for 403xAuth - stateless Web3 authentication via Solana.

## Installation

```bash
npm install @403xauth/server-express express
```

## Usage

```javascript
import express from 'express';
import { authMiddleware } from '@403xauth/server-express';

const app = express();

// Apply middleware to protected route
app.get('/api/profile', authMiddleware(), (req, res) => {
  // User information available in req.auth
  res.json({
    wallet: req.auth.wallet,
    publicKey: req.auth.publicKey.toBase58(),
  });
});
```

## Configuration Options

```javascript
import { authMiddleware } from '@403xauth/server-express';
import { PublicKey } from '@solana/web3.js';

// Example NFT gate check function
async function checkNFTGate(publicKey) {
  // Check NFT or SPL token ownership
  return true;
}

app.get('/api/profile', authMiddleware({
  challengeExpiry: 60000, // Challenge lifetime in milliseconds
  gateCheck: checkNFTGate, // Access check function
  generateNonce: () => customNonceGenerator(), // Custom nonce generator
}), (req, res) => {
  res.json({ wallet: req.auth.wallet });
});
```

## API

### `authMiddleware(options?)`

Creates Express middleware for authentication verification.

**Parameters:**
- `options.challengeExpiry` - Challenge lifetime in milliseconds (default: 60000)
- `options.gateCheck` - NFT/SPL token check function (optional)
- `options.generateNonce` - Custom nonce generator function (optional)

**Returns:** Express middleware function

## Types

After successful authentication, `req.auth` contains:
- `wallet` - Wallet address (string)
- `publicKey` - Solana public key (PublicKey)

## License

MIT

