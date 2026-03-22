#!/usr/bin/env node
/**
 * Generate angle pages from keyword clusters.
 * Usage: node scripts/generate-angles.js
 *
 * Reads: src/data/keyword-clusters.json
 * Writes: src/content/pages/angles/{id}.mdx + src/content/pages-pl/angles/{id}.mdx
 *
 * NOTE: This generates stub MDX files. Content should be reviewed and enriched.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const clusters = JSON.parse(readFileSync(join(ROOT, 'src/data/keyword-clusters.json'), 'utf-8'));

const EN_DIR = join(ROOT, 'src/content/pages/angles');
const PL_DIR = join(ROOT, 'src/content/pages-pl/angles');
mkdirSync(EN_DIR, { recursive: true });
mkdirSync(PL_DIR, { recursive: true });

let order = 100;

for (const cluster of clusters.clusters) {
  order++;
  const enFile = join(EN_DIR, `${cluster.id}.mdx`);
  const plFile = join(PL_DIR, `${cluster.id}.mdx`);

  if (!existsSync(enFile)) {
    const allKw = [cluster.primary, ...cluster.secondary];
    const en = `---
title: "${cluster.primary.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}"
description: "Deep exploration of ${cluster.primary} through the lens of WOLNO philosophy."
section: "angles"
order: ${order}
links: ["${cluster.base_page}"]
funnel_level: 2
seo_keywords: ${JSON.stringify(allKw)}
standalone_intro: "An in-depth exploration of ${cluster.primary}, connecting ${cluster.secondary[0]} with the WOLNO philosophy of radical freedom and patient deliberation."
schema_type: Article
---

## ${cluster.primary.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}

This page explores **${cluster.primary}** as it relates to the WOLNO philosophy.

Related topics: ${cluster.secondary.join(', ')}.

See also: [[${cluster.base_page.split('/').pop()}]]

> Everything is allowed. Everything can be done slowly. -"
`;
    writeFileSync(enFile, en);
    console.log(`EN: ${cluster.id}.mdx`);
  }

  if (!existsSync(plFile)) {
    const allKw = [cluster.primary, ...cluster.secondary];
    const pl = `---
title: "${cluster.primary.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}"
description: "Głęboka eksploracja ${cluster.primary} przez pryzmat filozofii WOLNO."
lang: "pl"
section: "angles"
order: ${order}
links: ["${cluster.base_page}"]
funnel_level: 2
seo_keywords: ${JSON.stringify(allKw)}
standalone_intro: "Dogłębna eksploracja ${cluster.primary}, łącząca ${cluster.secondary[0]} z filozofią WOLNO — radykalnej wolności i cierpliwej deliberacji."
schema_type: Article
---

## ${cluster.primary.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}

Ta strona eksploruje **${cluster.primary}** w kontekście filozofii WOLNO.

Powiązane tematy: ${cluster.secondary.join(', ')}.

Zobacz też: [[${cluster.base_page.split('/').pop()}]]

> Wszystko wolno. Wszystko można robić wolno. -"
`;
    writeFileSync(plFile, pl);
    console.log(`PL: ${cluster.id}.mdx`);
  }
}

console.log(`\nDone. ${clusters.clusters.length} angle pages generated (EN + PL).`);
