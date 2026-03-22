#!/usr/bin/env node
/**
 * Enable/disable modules in Fraktal Template
 * Usage:
 *   node scripts/enable-module.js                    # lista modulow
 *   node scripts/enable-module.js blog chat shop     # wlacz moduly
 *   node scripts/enable-module.js --disable chat     # wylacz modul
 *   node scripts/enable-module.js --all              # wlacz wszystkie
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const registryPath = path.join(projectRoot, 'src', 'modules', '_registry.json');
const manifestPath = path.join(projectRoot, 'public', 'site-manifest.json');

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[36m', red: '\x1b[31m', dim: '\x1b[2m', bold: '\x1b[1m'
};

function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    console.error(`${C.red}Blad odczytu ${filePath}: ${e.message}${C.reset}`);
    process.exit(1);
  }
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// Load registry
const registry = loadJSON(registryPath);
const args = process.argv.slice(2);
const isDisable = args.includes('--disable');
const isAll = args.includes('--all');
const moduleIds = args.filter(a => !a.startsWith('--'));

// No args = show list
if (args.length === 0) {
  console.log(`\n${C.bold}Fraktal Module Registry v${registry.version}${C.reset}\n`);

  const categories = {};
  for (const mod of registry.modules) {
    const cat = mod.category || 'other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(mod);
  }

  for (const [cat, mods] of Object.entries(categories).sort()) {
    const catDesc = registry.categories?.[cat] || cat;
    console.log(`${C.blue}${cat}${C.reset} ${C.dim}(${catDesc})${C.reset}`);
    for (const mod of mods) {
      const status = mod.enabled
        ? `${C.green}ON ${C.reset}`
        : `${C.dim}OFF${C.reset}`;
      const core = mod.core ? ` ${C.yellow}[core]${C.reset}` : '';
      console.log(`  ${status} ${mod.id}${core}`);
    }
    console.log();
  }

  console.log(`${C.dim}Uzycie: node scripts/enable-module.js <module1> <module2> ...${C.reset}`);
  console.log(`${C.dim}        node scripts/enable-module.js --disable <module>${C.reset}`);
  console.log(`${C.dim}        node scripts/enable-module.js --all${C.reset}\n`);
  process.exit(0);
}

// Enable/disable
const targets = isAll
  ? registry.modules.map(m => m.id)
  : moduleIds;

let changed = 0;

for (const id of targets) {
  const mod = registry.modules.find(m => m.id === id);
  if (!mod) {
    console.error(`${C.red}Modul nie znaleziony: ${id}${C.reset}`);
    continue;
  }

  if (mod.core && isDisable) {
    console.log(`${C.yellow}Nie mozna wylaczyc modulu core: ${id}${C.reset}`);
    continue;
  }

  const newState = !isDisable;
  if (mod.enabled !== newState) {
    mod.enabled = newState;
    changed++;
    const action = newState ? `${C.green}ON ${C.reset}` : `${C.red}OFF${C.reset}`;
    console.log(`  ${action} ${id}`);
  }
}

if (changed > 0) {
  // Save registry
  saveJSON(registryPath, registry);
  console.log(`\n${C.green}Zapisano _registry.json (${changed} zmian)${C.reset}`);

  // Update manifest
  if (fs.existsSync(manifestPath)) {
    const manifest = loadJSON(manifestPath);
    const active = registry.modules.filter(m => m.enabled).map(m => m.id);
    manifest.modules = manifest.modules || {};
    manifest.modules.active = active;

    // Update available list
    manifest.modules.available = registry.modules.map(m => ({
      id: m.id,
      version: "1.0.0",
      enabled: m.enabled,
      core: m.core || false,
      source: m.source || "template",
      category: m.category
    }));

    saveJSON(manifestPath, manifest);
    console.log(`${C.green}Zaktualizowano site-manifest.json (${active.length} aktywnych)${C.reset}`);
  }
} else {
  console.log(`${C.dim}Bez zmian.${C.reset}`);
}
