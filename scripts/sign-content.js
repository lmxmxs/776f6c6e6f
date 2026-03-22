#!/usr/bin/env node
/**
 * Sign content-integrity.json with Ed25519.
 * Generates keypair on first run, reuses existing key.
 * Output: public/.well-known/content-signature.txt + lmxmxs-pubkey.txt
 */
import { generateKeyPairSync, sign, createPrivateKey, createPublicKey } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const WELL_KNOWN = join(import.meta.dirname, '..', 'public', '.well-known');
const KEY_DIR = join(import.meta.dirname, '..', '.keys');
const PRIVATE_KEY_PATH = join(KEY_DIR, 'lmxmxs-ed25519.pem');
const INTEGRITY_FILE = join(WELL_KNOWN, 'content-integrity.json');
const SIGNATURE_FILE = join(WELL_KNOWN, 'content-signature.txt');
const PUBKEY_FILE = join(WELL_KNOWN, 'lmxmxs-pubkey.txt');

mkdirSync(KEY_DIR, { recursive: true });
mkdirSync(WELL_KNOWN, { recursive: true });

let privateKey;
let publicKey;

if (existsSync(PRIVATE_KEY_PATH)) {
  const pem = readFileSync(PRIVATE_KEY_PATH, 'utf-8');
  privateKey = createPrivateKey(pem);
  publicKey = createPublicKey(privateKey);
} else {
  const pair = generateKeyPairSync('ed25519');
  privateKey = pair.privateKey;
  publicKey = pair.publicKey;
  writeFileSync(PRIVATE_KEY_PATH, privateKey.export({ type: 'pkcs8', format: 'pem' }));
  console.log(`Generated new Ed25519 keypair → ${PRIVATE_KEY_PATH}`);
}

if (!existsSync(INTEGRITY_FILE)) {
  console.error('Run content-integrity.js first!');
  process.exit(1);
}

const content = readFileSync(INTEGRITY_FILE);
const signature = sign(null, content, privateKey);

const pubKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
const sigHex = signature.toString('hex');

writeFileSync(SIGNATURE_FILE, [
  '# 776F6C6E6F Content Signature',
  `# Signed by: lmxmxs`,
  `# Algorithm: Ed25519`,
  `# Date: ${new Date().toISOString()}`,
  '',
  sigHex,
].join('\n'));

writeFileSync(PUBKEY_FILE, [
  '# lmxmxs Ed25519 Public Key',
  '# Use to verify content-signature.txt against content-integrity.json',
  '',
  pubKeyPem,
].join('\n'));

console.log(`Content signed → ${SIGNATURE_FILE}`);
console.log(`Public key → ${PUBKEY_FILE}`);
