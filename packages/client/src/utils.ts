import { PublicKey, Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';

/**
 * Utilities for working with signatures and validation
 */

/**
 * Checks if object is a browser wallet adapter
 */
export function isWalletAdapter(wallet: any): boolean {
  return (
    wallet &&
    typeof wallet === 'object' &&
    'publicKey' in wallet &&
    'signMessage' in wallet &&
    typeof wallet.signMessage === 'function'
  );
}

/**
 * Checks if object is a Solana Keypair
 */
export function isKeypair(wallet: any): boolean {
  return wallet instanceof Keypair;
}

/**
 * Gets public key from wallet or keypair
 */
export function getPublicKey(wallet: any): PublicKey {
  if (isWalletAdapter(wallet)) {
    if (!wallet.publicKey) {
      throw new Error('Wallet is not connected. Call connect() before use.');
    }
    return wallet.publicKey;
  }
  
  if (isKeypair(wallet)) {
    return wallet.publicKey;
  }
  
  throw new Error('Unsupported wallet type');
}

/**
 * Signs message using wallet or keypair
 */
export async function signMessage(
  wallet: any,
  message: Uint8Array
): Promise<Uint8Array> {
  if (isWalletAdapter(wallet)) {
    const result = await wallet.signMessage(message);
    return result.signature;
  }
  
  if (isKeypair(wallet)) {
    return nacl.sign.detached(message, wallet.secretKey);
  }
  
  throw new Error('Unsupported wallet type for signing');
}

/**
 * Encodes string to Uint8Array
 */
export function encodeMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message);
}

/**
 * Encodes Uint8Array to base64 string
 */
export function encodeBase64(data: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(data).toString('base64');
  }
  // Use btoa for browser
  const binary = String.fromCharCode(...data);
  return btoa(binary);
}

/**
 * Creates challenge string for signing
 */
export function createChallengeString(
  method: string,
  path: string,
  challenge: string,
  nonce: string
): string {
  return `${method}\n${path}\n${challenge}\n${nonce}`;
}

