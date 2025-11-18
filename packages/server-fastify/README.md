# @403xauth/server-fastify

Fastify plugin for 403xAuth - stateless Web3 authentication via Solana.

## Installation

```bash
npm install @403xauth/server-fastify fastify
```

## Usage

```javascript
import Fastify from 'fastify';
import authPlugin from '@403xauth/server-fastify';

const fastify = Fastify();

// Register plugin
fastify.register(authPlugin, {
  challengeExpiry: 60000,
});

// Use middleware in route
fastify.get('/api/profile', async (request, reply) => {
  await fastify.authMiddleware(request, reply);
  
  return {
    wallet: request.auth.wallet,
    publicKey: request.auth.publicKey.toBase58(),
  };
});
```

## Configuration Options

```javascript
import { PublicKey } from '@solana/web3.js';

async function checkNFTGate(publicKey) {
  // Check NFT or SPL token ownership
  return true;
}

fastify.register(authPlugin, {
  challengeExpiry: 60000,
  gateCheck: checkNFTGate,
  generateNonce: () => customNonceGenerator(),
});
```

## API

### `authPlugin(options?)`

Fastify plugin for authentication verification.

**Parameters:**
- `options.challengeExpiry` - Challenge lifetime in milliseconds (default: 60000)
- `options.gateCheck` - NFT/SPL token check function (optional)
- `options.generateNonce` - Custom nonce generator function (optional)

After plugin registration, `fastify.authMiddleware` is available for use in routes.

## Types

After successful authentication, `request.auth` contains:
- `wallet` - Wallet address (string)
- `publicKey` - Solana public key (PublicKey)

## License

MIT

