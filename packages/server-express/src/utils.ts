import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

/**
 * Utilities for server library
 */

/**
 * Generates random nonce
 */
export function generateNonce(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js
    const { randomBytes } = require('crypto');
    randomBytes(32).copy(array);
  }
  return Buffer.from(array).toString('base64');
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

/**
 * Decodes base64 string to Uint8Array
 */
export function decodeBase64(data: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(data, 'base64');
  }
  // Use atob for browser
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Verifies Solana signature
 */
export async function verifySignature(
  publicKey: PublicKey,
  message: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  try {
    return nacl.sign.detached.verify(message, signature, publicKey.toBytes());
  } catch {
    return false;
  }
}

/**
 * Encodes string to Uint8Array
 */
export function encodeMessage(message: string): Uint8Array {
  return new TextEncoder().encode(message);
}

