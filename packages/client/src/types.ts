import { PublicKey, Keypair } from '@solana/web3.js';

/**
 * Types for 403xAuth client library
 */

export interface ChallengeResponse {
  challenge: string;
  nonce: string;
  expiresAt: number;
}

export interface AuthHeaders {
  'X-Auth-Wallet': string;
  'X-Auth-Signature': string;
  'X-Auth-Challenge': string;
  'X-Auth-Method': string;
  'X-Auth-Path': string;
}

export interface WalletAdapter {
  publicKey: PublicKey | null;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect?(): Promise<void>;
}

export interface AuthClientConfig {
  /**
   * Browser wallet (Phantom, Backpack, Solflare) or keypair for Node.js
   */
  wallet?: WalletAdapter | Keypair;
  
  /**
   * Base API URL (optional)
   */
  baseURL?: string;
  
  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;
}

export interface AuthResult {
  wallet: string;
  signature: string;
  challenge: string;
}

