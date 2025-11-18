import { PublicKey, Keypair } from '@solana/web3.js';
import {
  AuthClientConfig,
  ChallengeResponse,
  AuthHeaders,
  WalletAdapter,
} from './types';
import {
  getPublicKey,
  signMessage,
  encodeMessage,
  encodeBase64,
  createChallengeString,
  isWalletAdapter,
} from './utils';

/**
 * Client for working with 403xAuth protocol
 */
export class AuthClient {
  private wallet?: WalletAdapter | Keypair;
  private baseURL?: string;
  private timeout: number;

  constructor(config: AuthClientConfig = {}) {
    this.wallet = config.wallet;
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Sets wallet for authentication
   */
  setWallet(wallet: WalletAdapter | Keypair): void {
    this.wallet = wallet;
  }

  /**
   * Gets current wallet public key
   */
  getPublicKey(): PublicKey | null {
    if (!this.wallet) {
      return null;
    }
    
    try {
      return getPublicKey(this.wallet);
    } catch {
      return null;
    }
  }

  /**
   * Checks if wallet is connected
   */
  isConnected(): boolean {
    if (!this.wallet) {
      return false;
    }
    
    if (isWalletAdapter(this.wallet)) {
      return this.wallet.publicKey !== null;
    }
    
    return true; // Keypair is always available
  }

  /**
   * Connects browser wallet (if required)
   */
  async connect(): Promise<void> {
    if (!this.wallet) {
      throw new Error('Wallet is not set');
    }
    
    if (isWalletAdapter(this.wallet) && this.wallet.connect) {
      await this.wallet.connect();
    }
  }

  /**
   * Handles 403 response and extracts challenge
   */
  private async extractChallenge(response: Response): Promise<ChallengeResponse> {
    if (response.status !== 403) {
      throw new Error('Expected 403 Forbidden response');
    }

    const data = await response.json();
    
    if (!data.challenge || !data.nonce) {
      throw new Error('Invalid challenge format in server response');
    }

    const expiresAt = Date.now() + (data.expiresIn || 60000); // Default 60 seconds
    
    return {
      challenge: data.challenge,
      nonce: data.nonce,
      expiresAt,
    };
  }

  /**
   * Creates authentication headers
   */
  private async createAuthHeaders(
    method: string,
    path: string,
    challenge: ChallengeResponse
  ): Promise<AuthHeaders> {
    if (!this.wallet) {
      throw new Error('Wallet is not set');
    }

    const publicKey = getPublicKey(this.wallet);
    const challengeString = createChallengeString(
      method,
      path,
      challenge.challenge,
      challenge.nonce
    );
    
    const message = encodeMessage(challengeString);
    const signature = await signMessage(this.wallet, message);
    const signatureBase64 = encodeBase64(signature);

    return {
      'X-Auth-Wallet': publicKey.toBase58(),
      'X-Auth-Signature': signatureBase64,
      'X-Auth-Challenge': challenge.challenge,
      'X-Auth-Method': method,
      'X-Auth-Path': path,
    };
  }

  /**
   * Makes request with automatic authentication handling
   */
  async fetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    if (!this.wallet) {
      throw new Error('Wallet is not set. Use setWallet() or pass it to constructor.');
    }

    // Check wallet connection
    if (!this.isConnected()) {
      await this.connect();
    }

    const url = typeof input === 'string' 
      ? (this.baseURL ? new URL(input, this.baseURL).toString() : input)
      : input.toString();
    
    const method = init?.method || 'GET';
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;

    // First request without signature
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const firstResponse = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If request is successful, return response
      if (firstResponse.status !== 403) {
        return firstResponse;
      }

      // Extract challenge from 403 response
      const challenge = await this.extractChallenge(firstResponse);

      // Check challenge expiration
      if (Date.now() > challenge.expiresAt) {
        throw new Error('Challenge expired');
      }

      // Create authentication headers
      const authHeaders = await this.createAuthHeaders(method, path, challenge);

      // Retry request with signature
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), this.timeout);

      try {
        const retryResponse = await fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            ...authHeaders,
          },
          signal: retryController.signal,
        });

        clearTimeout(retryTimeoutId);
        return retryResponse;
      } catch (error) {
        clearTimeout(retryTimeoutId);
        throw error;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Makes GET request
   */
  async get(url: string, init?: RequestInit): Promise<Response> {
    return this.fetch(url, { ...init, method: 'GET' });
  }

  /**
   * Makes POST request
   */
  async post(url: string, body?: any, init?: RequestInit): Promise<Response> {
    return this.fetch(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Makes PUT request
   */
  async put(url: string, body?: any, init?: RequestInit): Promise<Response> {
    return this.fetch(url, {
      ...init,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Makes DELETE request
   */
  async delete(url: string, init?: RequestInit): Promise<Response> {
    return this.fetch(url, { ...init, method: 'DELETE' });
  }
}

// Export types
export * from './types';
export * from './utils';

