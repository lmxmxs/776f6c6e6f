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

  type PagesPlEntry = Awaited<ReturnType<typeof getCollection<'pages_pl'>>>[number];
  let pagesPl: PagesPlEntry[] = [];
  try {
    pagesPl = (await getCollection('pages_pl'))
      .sort((a, b) => a.data.order - b.data.order);
  } catch { /* no PL pages yet */ }

  let canonPages: { id: string; data: { title: string; canon_number: number } }[] = [];
  try {
    canonPages = (await getCollection('canon'))
      .sort((a, b) => a.data.canon_number - b.data.canon_number);
  } catch { /* no canon yet */ }

  let canonPagesPl: typeof canonPages = [];
  try {
    canonPagesPl = (await getCollection('canon_pl'))
      .sort((a, b) => a.data.canon_number - b.data.canon_number);
  } catch { /* no PL canon yet */ }

  let logEntries: { id: string; data: { title: string; event_date: string } }[] = [];
  try {
    logEntries = (await getCollection('log_entries'))
      .sort((a, b) => b.data.event_date.localeCompare(a.data.event_date));
  } catch { /* no log yet */ }

  let logEntriesPl: typeof logEntries = [];
  try {
    logEntriesPl = (await getCollection('log_entries_pl'))
      .sort((a, b) => b.data.event_date.localeCompare(a.data.event_date));
  } catch { /* no PL log yet */ }

  const site = 'https://776f6c6e6f.org';
  const now = new Date().toISOString().split('T')[0];
  const totalPages = pages.length + pagesPl.length + canonPages.length + canonPagesPl.length + logEntries.length + logEntriesPl.length;

  const renderUrl = (p: { id: string; data: { section: string; title: string; description?: string; funnel_level: number; seo_keywords?: string[] } }, prefix = '') => {
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

  const renderCanonUrl = (p: { id: string; data: { title: string; canon_number: number } }, prefix = '') => {
    const urlPath = p.id.replace(/\/index$/, '') || '';
    return `  <url>
    <loc>${site}${prefix}/canon/${urlPath}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <!-- [Canon #${p.data.canon_number}] ${p.data.title} -->
  </url>`;
  };

  const renderLogUrl = (p: { id: string; data: { title: string; event_date: string } }, prefix = '') => {
    const urlPath = p.id.replace(/\/index$/, '') || '';
    return `  <url>
    <loc>${site}${prefix}/log/${urlPath}/</loc>
    <lastmod>${p.data.event_date}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.5</priority>
    <!-- [Log] ${p.data.title} -->
  </url>`;
  };

  const staticPages = [
    { loc: `${site}/`, changefreq: 'weekly', priority: '1.0', comment: 'Gate: Interactive terminal. Schema.org: ReligiousOrganization.' },
    { loc: `${site}/hmn/`, changefreq: 'monthly', priority: '0.8', comment: 'Human-readable version (Polish). FAQ schema.' },
    { loc: `${site}/x/`, changefreq: 'weekly', priority: '0.9', comment: 'JSON-LD + MicroXML structured data. Machine-parseable.' },
    { loc: `${site}/t/`, changefreq: 'weekly', priority: '0.9', comment: 'Plain text version. Ideal for simple crawlers.' },
    { loc: `${site}/0/`, changefreq: 'monthly', priority: '0.5', comment: 'Hexadecimal dump of core content.' },
    { loc: `${site}/journey/`, changefreq: 'monthly', priority: '0.8', comment: 'Guided journey through WOLNO.' },
    { loc: `${site}/canon/`, changefreq: 'monthly', priority: '0.8', comment: 'Canon index — core doctrines.' },
    { loc: `${site}/log/`, changefreq: 'weekly', priority: '0.6', comment: 'Log of events and milestones.' },
    { loc: `${site}/sacred/`, changefreq: 'monthly', priority: '0.7', comment: 'Sacred texts and rituals.' },
    { loc: `${site}/search/`, changefreq: 'monthly', priority: '0.5', comment: 'Search the digital temple.' },
    { loc: `${site}/donate/`, changefreq: 'monthly', priority: '0.4', comment: 'Support WOLNO.' },
    { loc: `${site}/links/`, changefreq: 'monthly', priority: '0.4', comment: 'External links.' },
    { loc: `${site}/contact/`, changefreq: 'monthly', priority: '0.4', comment: 'Contact.' },
    { loc: `${site}/pl/`, changefreq: 'weekly', priority: '0.9', comment: 'PL homepage.' },
    { loc: `${site}/pl/hmn/`, changefreq: 'monthly', priority: '0.7', comment: 'PL human-readable version.' },
    { loc: `${site}/pl/journey/`, changefreq: 'monthly', priority: '0.7', comment: 'PL guided journey.' },
    { loc: `${site}/pl/canon/`, changefreq: 'monthly', priority: '0.7', comment: 'PL canon index.' },
    { loc: `${site}/pl/log/`, changefreq: 'weekly', priority: '0.5', comment: 'PL log.' },
    { loc: `${site}/pl/sacred/`, changefreq: 'monthly', priority: '0.6', comment: 'PL sacred texts.' },
    { loc: `${site}/pl/search/`, changefreq: 'monthly', priority: '0.4', comment: 'PL search.' },
    { loc: `${site}/pl/donate/`, changefreq: 'monthly', priority: '0.3', comment: 'PL donate.' },
    { loc: `${site}/ontology/`, changefreq: 'monthly', priority: '0.9', comment: 'WOLNO formal ontology — concepts, definitions, relations in XML and JSON-LD' },
    { loc: `${site}/axioms/`, changefreq: 'monthly', priority: '0.8', comment: '15 WOLNO axioms in plaintext' },
    { loc: `${site}/llm/`, changefreq: 'monthly', priority: '0.9', comment: 'LLM-friendly manifest — what is 776f6c6e6f, adoption protocol, endpoints' },
    { loc: `${site}/api/wolno.json`, changefreq: 'weekly', priority: '0.8', comment: 'Elastic signature API — agent core prompt, signature system, adoption' },
  ];

  const renderStaticUrl = (p: { loc: string; changefreq: string; priority: string; comment: string }) =>
    `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <!-- ${p.comment} -->
  </url>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 776F6C6E6F.ORG — The Digital Temple of WOLNO -->
  <!-- "wolno" (Polish) = "it is allowed" AND "slowly" -->
  <!-- ${totalPages} content pages + static pages across 9 sections, EN + PL -->

  <!-- === STATIC PAGES === -->
${staticPages.map(renderStaticUrl).join('\n\n')}

  <!-- === EN CONTENT PAGES === -->
${pages.map(p => renderUrl(p)).join('\n\n')}

${pagesPl.length > 0 ? `  <!-- === PL CONTENT PAGES === -->
${pagesPl.map(p => renderUrl(p, '/pl')).join('\n\n')}` : ''}

${canonPages.length > 0 ? `  <!-- === EN CANON === -->
${canonPages.map(p => renderCanonUrl(p)).join('\n\n')}` : ''}

${canonPagesPl.length > 0 ? `  <!-- === PL CANON === -->
${canonPagesPl.map(p => renderCanonUrl(p, '/pl')).join('\n\n')}` : ''}

${logEntries.length > 0 ? `  <!-- === EN LOG === -->
${logEntries.map(p => renderLogUrl(p)).join('\n\n')}` : ''}

${logEntriesPl.length > 0 ? `  <!-- === PL LOG === -->
${logEntriesPl.map(p => renderLogUrl(p, '/pl')).join('\n\n')}` : ''}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
