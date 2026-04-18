import type { APIRoute } from 'astro';

// Master sitemap index — merges curated bots sitemap + auto-generated filtered sitemap
// Submit https://776f6c6e6f.org/sitemap-all.xml to Google Search Console
export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const site = 'https://776f6c6e6f.org';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- sitemap-bots.xml: curated, prioritized, with section metadata — submit THIS to GSC -->
  <sitemap>
    <loc>${site}/sitemap-bots.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <!-- sitemap-0.xml: auto-generated from all pages (filtered) -->
  <sitemap>
    <loc>${site}/sitemap-0.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
