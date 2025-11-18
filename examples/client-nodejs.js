/**
 * Example of using the client library in Node.js
 */

import { AuthClient } from '@403xauth/client';
import { Keypair } from '@solana/web3.js';

async function main() {
  // Create or load keypair
  const keypair = Keypair.generate();
  // Or load from file:
  // const keypair = Keypair.fromSecretKey(secretKey);

  // Create client with keypair
  const client = new AuthClient({
    wallet: keypair,
    baseURL: 'http://localhost:3000',
  });

  console.log('Public key:', client.getPublicKey()?.toBase58());

  try {
    // Make request - library automatically handles 403 and signs challenge
    const response = await client.get('/api/profile');
    const data = await response.json();
    
    console.log('Server response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

