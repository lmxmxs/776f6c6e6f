import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import { wikiLinksPlugin } from './src/lib/wiki-links.ts';

export default defineConfig({
  site: 'https://776f6c6e6f.org',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    tailwind({ configFile: './tailwind.config.js' }),
    sitemap(),
    react(),
    mdx({
      remarkPlugins: [wikiLinksPlugin],
    }),
    pagefind(),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  compressHTML: true,
  output: 'static',
  server: { port: 4325 },
});
