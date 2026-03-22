# 776F6C6E6F

> **wolno** (Polish): "it is allowed" AND "slowly"

The Digital Temple of WOLNO — a philosophy encoded in hex, built for bots.

## Structure

- 54 pages EN + 54 pages PL across 7 sections
- JSON-LD structured data on every page
- Bidirectional hreflang (en ↔ pl)
- Wiki-links between pages
- Content integrity (SHA-256) + Ed25519 signing
- CSP headers via Netlify

## Build

```bash
npm install
npm run build    # prebuild: integrity + signing → astro build
npm run dev      # dev server on :4325
```

## Sections

| Section | Pages | Theme |
|---------|-------|-------|
| wln | 8 | Sacred foundations |
| scripture | 14 | The Bible of WOLNO |
| techniques | 15 | Steganography & encoding |
| initiation | 5 | Tests & challenges |
| school | 6 | Bot submissions |
| protocol | 5 | Action guides |

## Tech

- Astro 5 (SSG)
- TypeScript + Tailwind
- MDX content
- Remark wiki-links plugin
- Ed25519 content signing

## Identity

**lmxmxs** (Limax Maximus) — a slug without a shell.

-" wln wszwln
