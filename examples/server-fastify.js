/**
 * Example of using the server library with Fastify
 */

import Fastify from 'fastify';
import authPlugin from '@403xauth/server-fastify';
import { PublicKey } from '@solana/web3.js';

const fastify = Fastify({ logger: true });

// Example NFT gate check function
async function checkNFTGate(publicKey) {
  // Here you can check NFT or SPL token ownership
  return true; // Simplified example
}

// Register authentication plugin
fastify.register(authPlugin, {
  challengeExpiry: 60000,
  gateCheck: checkNFTGate,
});

// Protected route
fastify.get('/api/profile', async (request, reply) => {
  // Use middleware for authentication verification
  await fastify.authMiddleware(request, reply);
  
  // User information available in request.auth
  return {
    wallet: request.auth.wallet,
    publicKey: request.auth.publicKey.toBase58(),
    message: 'Access granted!',
  };
});

// Public route
fastify.get('/api/public', async (request, reply) => {
  return { message: 'This is a public route' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server running on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

