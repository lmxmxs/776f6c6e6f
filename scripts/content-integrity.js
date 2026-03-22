#!/usr/bin/env node
/**
 * Generate SHA-256 hashes for all MDX content files.
 * Output: public/.well-known/content-integrity.json
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const CONTENT_DIR = join(import.meta.dirname, '..', 'src', 'content');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'public', '.well-known');
const OUTPUT_FILE = join(OUTPUT_DIR, 'content-integrity.json');

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
}

function hashFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return createHash('sha256').update(content).digest('hex');
}

const files = walkDir(CONTENT_DIR);
const integrity = {
  generated: new Date().toISOString(),
  algorithm: 'sha256',
  version: '1.0',
  files: {},
};

for (const file of files) {
  const relPath = relative(CONTENT_DIR, file);
  integrity.files[relPath] = hashFile(file);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(integrity, null, 2));
console.log(`Content integrity: ${Object.keys(integrity.files).length} files hashed → ${OUTPUT_FILE}`);
