# 403xProof

Cryptographic proof generation and verification library for Solana applications.

## 📦 Installation

```bash
npm install @403xproof/core
```

## 🚀 Quick Start

```javascript
import { ProofGenerator, ProofVerifier } from '@403xproof/core';

// Generate a proof
const generator = new ProofGenerator({
  wallet: window.solana,
});

const proof = await generator.generate({
  message: 'Hello, World!',
  timestamp: Date.now(),
});

// Verify a proof
const verifier = new ProofVerifier();
const isValid = await verifier.verify(proof);

if (isValid) {
  console.log('Proof is valid!');
}
```

## 📚 Documentation

Full documentation is available on the [project website](https://403xproof.xyz/docs).

## 🔐 How It Works

1. Generate a cryptographic proof from a message and wallet signature
2. Proof includes wallet address, message, signature, and timestamp
3. Verify proofs by checking signature validity against the message
4. Proofs are tamper-proof and verifiable by anyone

## ✨ Features

- ✅ Cryptographic proof generation
- ✅ Signature verification
- ✅ Timestamp validation
- ✅ Wallet address verification
- ✅ TypeScript support
- ✅ Browser and Node.js compatible

## 📄 License

MIT

