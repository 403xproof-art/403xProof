import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { randomBytes } from 'crypto';

/**
 * Utilities for Fastify server library
 */

/**
 * Generates random nonce
 */
export function generateNonce(): string {
  return randomBytes(32).toString('base64');
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
  return Buffer.from(data, 'base64');
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

