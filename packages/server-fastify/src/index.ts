import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { PublicKey } from '@solana/web3.js';
import {
  AuthRequest,
  AuthPluginOptions,
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
 * Decorator for adding auth middleware to Fastify
 */
async function authPlugin(
  fastify: FastifyInstance,
  options: AuthPluginOptions
) {
  const challengeExpiry = options.challengeExpiry || 60000;
  const gateCheck = options.gateCheck;
  const customGenerateNonce = options.generateNonce || generateNonce;

  /**
   * Middleware for authentication verification
   */
  async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const authReq = request as AuthRequest;

    // Extract authentication headers
    const walletHeader = request.headers['x-auth-wallet'] as string;
    const signatureHeader = request.headers['x-auth-signature'] as string;
    const challengeHeader = request.headers['x-auth-challenge'] as string;
    const methodHeader = request.headers['x-auth-method'] as string;
    const pathHeader = request.headers['x-auth-path'] as string;

    // If headers are missing, return challenge
    if (!walletHeader || !signatureHeader || !challengeHeader) {
      return sendChallenge(authReq, reply, customGenerateNonce, challengeExpiry);
    }

    try {
      // Validate headers
      if (!methodHeader || !pathHeader) {
        return reply.status(400).send({ error: 'Missing required headers' });
      }

      // Check that method and path match
      const currentMethod = request.method.toUpperCase();
      const currentPath = request.url.split('?')[0];
      const queryString = request.url.includes('?') ? '?' + request.url.split('?')[1] : '';
      const fullPath = currentPath + queryString;

      if (methodHeader !== currentMethod || pathHeader !== fullPath) {
        return sendChallenge(authReq, reply, customGenerateNonce, challengeExpiry);
      }

      // Parse public key
      let publicKey: PublicKey;
      try {
        publicKey = new PublicKey(walletHeader);
      } catch {
        return reply.status(400).send({ error: 'Invalid public key format' });
      }

      // Restore challenge
      const challenge = challengeHeader;
      const nonce = challenge;

      // Create string for signature verification
      const challengeString = createChallengeString(
        currentMethod,
        fullPath,
        challenge,
        nonce
      );
      const message = encodeMessage(challengeString);

      // Decode signature
      let signature: Uint8Array;
      try {
        signature = decodeBase64(signatureHeader);
      } catch {
        return reply.status(400).send({ error: 'Invalid signature format' });
      }

      // Verify signature
      const isValid = await verifySignature(publicKey, message, signature);
      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      // Check NFT/SPL gates
      if (gateCheck) {
        const hasAccess = await gateCheck(publicKey);
        if (!hasAccess) {
          return reply.status(403).send({ error: 'Access denied: gate conditions not met' });
        }
      }

      // Add user information to request
      authReq.auth = {
        wallet: walletHeader,
        publicKey,
      };
    } catch (error) {
      fastify.log.error(error, 'Error during authentication verification');
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * Sends challenge to client
   */
  function sendChallenge(
    request: FastifyRequest,
    reply: FastifyReply,
    generateNonceFn: () => string,
    expiry: number
  ): void {
    const nonce = generateNonceFn();
    const challenge = nonce;
    
    const challengeData: ChallengeData = {
      challenge,
      nonce,
      expiresAt: Date.now() + expiry,
      expiresIn: expiry,
    };

    reply.status(403).send(challengeData);
  }

  // Register decorator for use in routes
  fastify.decorate('authMiddleware', authMiddleware);
}

/**
 * Types for TypeScript
 */
declare module 'fastify' {
  interface FastifyInstance {
    authMiddleware: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

export default fp(authPlugin, {
  name: '@403xauth/server-fastify',
});

// Export types
export * from './types';

