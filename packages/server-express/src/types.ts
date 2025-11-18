import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';

/**
 * Types for Express server library
 */

export interface AuthRequest extends Request {
  auth?: {
    wallet: string;
    publicKey: PublicKey;
  };
}

export interface AuthMiddlewareOptions {
  /**
   * Challenge lifetime in milliseconds (default: 60000 = 60 seconds)
   */
  challengeExpiry?: number;
  
  /**
   * NFT/SPL token check function (optional)
   */
  gateCheck?: (publicKey: PublicKey) => Promise<boolean>;
  
  /**
   * Custom nonce generator function (optional)
   */
  generateNonce?: () => string;
}

export interface ChallengeData {
  challenge: string;
  nonce: string;
  expiresAt: number;
  expiresIn: number;
}

