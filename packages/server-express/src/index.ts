import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';
import {
  AuthRequest,
  AuthMiddlewareOptions,
  ChallengeData,
} from './types';
import {
  generateNonce,
  createChallengeString,
  decodeBase64,
  verifySignature,
  encodeMessage,
} from './utils';

/**
 * Middleware for authentication via 403xAuth protocol
 */
export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const challengeExpiry = options.challengeExpiry || 60000; // Default 60 seconds
  const gateCheck = options.gateCheck;
  const customGenerateNonce = options.generateNonce || generateNonce;

  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    // Extract authentication headers
    const walletHeader = req.headers['x-auth-wallet'] as string;
    const signatureHeader = req.headers['x-auth-signature'] as string;
    const challengeHeader = req.headers['x-auth-challenge'] as string;
    const methodHeader = req.headers['x-auth-method'] as string;
    const pathHeader = req.headers['x-auth-path'] as string;

    // If headers are missing, return challenge
    if (!walletHeader || !signatureHeader || !challengeHeader) {
      return sendChallenge(authReq, res, customGenerateNonce, challengeExpiry);
    }

    try {
      // Validate headers
      if (!methodHeader || !pathHeader) {
        return res.status(400).json({ error: 'Missing required headers' });
      }

      // Check that method and path match
      const currentMethod = req.method.toUpperCase();
      const currentPath = req.path + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');

      if (methodHeader !== currentMethod || pathHeader !== currentPath) {
        return sendChallenge(authReq, res, customGenerateNonce, challengeExpiry);
      }

      // Parse public key
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletHeader);
      } catch {
        return res.status(400).json({ error: 'Invalid public key format' });
      }

      // Restore challenge from headers
      // For signature verification we need nonce, which should be obtained from challenge
      // In real implementation nonce should be stored together with challenge
      // Here simplified version - use challenge as nonce
      const challenge = challengeHeader;
      const nonce = challenge; // Simplification: in reality nonce should be stored separately

      // Create string for signature verification
      const challengeString = createChallengeString(
        currentMethod,
        currentPath,
        challenge,
        nonce
      );
      const message = encodeMessage(challengeString);

      // Decode signature
      let signature: Uint8Array;
      try {
        signature = decodeBase64(signatureHeader);
      } catch {
        return res.status(400).json({ error: 'Invalid signature format' });
      }

      // Verify signature
      const isValid = await verifySignature(publicKey, message, signature);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Check NFT/SPL gates if configured
      if (gateCheck) {
        const hasAccess = await gateCheck(publicKey);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied: gate conditions not met' });
        }
      }

      // Add user information to request
      authReq.auth = {
        wallet: walletHeader,
        publicKey,
      };

      next();
    } catch (error) {
      console.error('Error during authentication verification:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Sends challenge to client
 */
function sendChallenge(
  req: Request,
  res: Response,
  generateNonce: () => string,
  expiry: number
): void {
  const nonce = generateNonce();
  const challenge = nonce; // Simplification: in reality challenge can be more complex
  
  const challengeData: ChallengeData = {
    challenge,
    nonce,
    expiresAt: Date.now() + expiry,
    expiresIn: expiry,
  };

  res.status(403).json(challengeData);
}

// Export types
export * from './types';

