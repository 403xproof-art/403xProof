/**
 * Example of using the server library with Express
 */

import express from 'express';
import { authMiddleware } from '@403xauth/server-express';
import { PublicKey } from '@solana/web3.js';

const app = express();
app.use(express.json());

// Example NFT gate check function
async function checkNFTGate(publicKey) {
  // Here you can check NFT or SPL token ownership
  // For example, via RPC request to Solana
  // const nfts = await connection.getParsedTokenAccountsByOwner(...);
  // return nfts.length > 0;
  return true; // Simplified example
}

// Apply middleware to protected route
app.get('/api/profile', authMiddleware({
  challengeExpiry: 60000, // 60 seconds
  gateCheck: checkNFTGate, // Optional
}), (req, res) => {
  // User information available in req.auth
  res.json({
    wallet: req.auth.wallet,
    publicKey: req.auth.publicKey.toBase58(),
    message: 'Access granted!',
  });
});

// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public route' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

