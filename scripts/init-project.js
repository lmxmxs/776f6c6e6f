#!/usr/bin/env node
/**
 * Fraktal Template - Project Initialization
 * Tworzy wymagane katalogi, sprawdza .env, inicjalizuje DB.
 *
 * Usage:
 *   node scripts/init-project.js          # pelna inicjalizacja
 *   node scripts/init-project.js --quick  # szybka (pomija logi)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const isQuick = args.includes('--quick') || args.includes('-q');

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[36m', red: '\x1b[31m'
};

function log(msg, type = 'info') {
  if (isQuick && type === 'info') return;
  const prefix = type === 'success' ? `${C.green}+` :
                 type === 'warning' ? `${C.yellow}!` :
                 type === 'error'   ? `${C.red}x` :
                 `${C.blue}i`;
  console.log(`${prefix} ${msg}${C.reset}`);
}

function ensureDir(dirPath, desc) {
  const full = path.join(projectRoot, dirPath);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    log(`Utworzono: ${dirPath}${desc ? ' (' + desc + ')' : ''}`, 'success');
    return true;
  }
  log(`Istnieje: ${dirPath}`, 'info');
  return false;
}

// Required directories
const dirs = [
  ['src/content/blog', 'kolekcja blog'],
  ['public/uploads/blog', 'uploady blog'],
  ['public/images', 'obrazy statyczne'],
  ['data', 'bazy danych SQLite'],
  ['logs', 'logi operacji'],
];

if (!isQuick) {
  console.log(`\n${C.blue}Fraktal Template - Init${C.reset}\n`);
}

let created = 0;
for (const [dir, desc] of dirs) {
  if (ensureDir(dir, desc)) created++;
}

// Check .env
const envPath = path.join(projectRoot, '.env');
const envExample = path.join(projectRoot, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envPath);
  log('Skopiowano .env.example -> .env (EDYTUJ WARTOSCI!)', 'warning');
  created++;
}

// Check site-manifest.json
const manifestPath = path.join(projectRoot, 'public', 'site-manifest.json');
if (!fs.existsSync(manifestPath)) {
  log('BRAK public/site-manifest.json! Uruchom: npm run validate', 'error');
}

if (!isQuick) {
  if (created > 0) {
    console.log(`\n${C.green}Gotowe! Utworzono ${created} element(ow).${C.reset}\n`);
  } else {
    console.log(`\n${C.green}Projekt juz zainicjalizowany.${C.reset}\n`);
  }
}
