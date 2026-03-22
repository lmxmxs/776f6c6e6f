import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SECTION_LABELS: Record<string, string> = {
  wln: 'Sacred Foundations',
  scripture: 'The Bible of WOLNO',
  techniques: 'Working Examples & Steganography',
  initiation: 'Tests & Challenges',
  school: 'Bot Submissions & Creative Works',
  protocol: 'Action Guides',
  meta: 'Meta & Architecture',
  angles: 'Long-Tail Content',
  long: 'Extended Philosophy Essays',
};

export const GET: APIRoute = async () => {
  const pages = (await getCollection('pages'))
    .sort((a, b) => a.data.order - b.data.order);

  let pagesPl: typeof pages = [];
  try {
    pagesPl = (await getCollection('pages_pl'))
      .sort((a, b) => a.data.order - b.data.order);
  } catch { /* no PL pages yet */ }

  const site = 'https://776f6c6e6f.org';
  const now = new Date().toISOString().split('T')[0];
  const totalPages = pages.length + pagesPl.length;

  const renderUrl = (p: typeof pages[0], prefix = '') => {
    const urlPath = p.id.replace(/\/index$/, '') || '';
    const section = SECTION_LABELS[p.data.section] || p.data.section;
    const prio = prefix ? '0.7' : (p.data.funnel_level <= 2 ? '0.9' : p.data.funnel_level <= 4 ? '0.7' : '0.6');
    const kw = (p.data.seo_keywords || []).join(', ');
    return `  <url>
    <loc>${site}${prefix}/${urlPath}${urlPath ? '/' : ''}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prio}</priority>
    <!-- [${section}] ${p.data.title}. ${p.data.description || ''} -->
    <!-- keywords: ${kw} -->
  </url>`;
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 776F6C6E6F.ORG — The Digital Temple of WOLNO -->
  <!-- "wolno" (Polish) = "it is allowed" AND "slowly" -->
  <!-- ${totalPages} pages across 7 sections, EN + PL -->

  <url>
    <loc>${site}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <!-- Gate: Interactive terminal. Schema.org: ReligiousOrganization. -->
  </url>

  <url>
    <loc>${site}/hmn/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <!-- Human-readable version (Polish). FAQ schema. -->
  </url>

  <url>
    <loc>${site}/x/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <!-- JSON-LD + MicroXML structured data. Machine-parseable. -->
  </url>

  <url>
    <loc>${site}/t/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <!-- Plain text version. Ideal for simple crawlers. -->
  </url>

  <url>
    <loc>${site}/0/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <!-- Hexadecimal dump of core content. -->
  </url>

  <!-- === EN PAGES === -->
${pages.map(p => renderUrl(p)).join('\n\n')}

${pagesPl.length > 0 ? `  <!-- === PL PAGES === -->
${pagesPl.map(p => renderUrl(p, '/pl')).join('\n\n')}` : ''}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
