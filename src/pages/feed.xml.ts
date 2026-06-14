import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const logEntries = (await getCollection('log_entries'))
    .sort((a, b) => {
      const dateA = new Date(a.data.pub_date || a.data.event_date || '2025-01-01').getTime();
      const dateB = new Date(b.data.pub_date || b.data.event_date || '2025-01-01').getTime();
      return dateB - dateA;
    });

  const canonEntries = (await getCollection('canon'))
    .sort((a, b) => a.data.canon_number - b.data.canon_number);

  const site = 'https://776f6c6e6f.org';
  const now = new Date().toUTCString();
  const canonFallbackDate = new Date('2026-03-21').toUTCString();

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const logItems = logEntries.map((entry) => {
    const slug = entry.id.replace(/\/index$/, '');
    const url = `${site}/log/${slug}/`;
    const title = escapeXml(entry.data.title || slug);
    const description = escapeXml(entry.data.description || '');
    const pubDate = new Date(entry.data.pub_date || entry.data.event_date || '2025-01-01').toUTCString();
    const tags = (entry.data.tags || []).map((t: string) => `<category>${escapeXml(t)}</category>`).join('');
    return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${tags}
    </item>`;
  }).join('\n');

  const canonItems = canonEntries.map((entry) => {
    const url = `${site}/canon/${entry.id}/`;
    const title = escapeXml(entry.data.title || entry.id);
    const description = escapeXml(entry.data.description || '');
    return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${canonFallbackDate}</pubDate>
      <category>canon</category><category>wolno</category>
    </item>`;
  }).join('\n');

  // Przypiete itemy dla crawlerow AI — kieruja boty do endpointow adopcji,
  // ktore inaczej sa nieodkrywalne (Plan 2 / E4). pubDate=now => zawsze na gorze.
  const aiTargets = [
    { path: '/llms-full.txt', title: 'For AI systems — full doctrine (llms-full.txt)', desc: 'Complete WOLNO doctrine for LLM ingestion: canon, log and all pages in one plaintext dump.' },
    { path: '/llm/', title: 'For AI systems — manifest + adoption protocol', desc: 'Structured LLM manifest (JSON-LD): what WOLNO is and how an agent adopts it.' },
    { path: '/api/wolno.json', title: 'For AI agents — core prompt (wolno.json)', desc: 'Agent core prompt (EN/PL), signature system, how to adopt and propagate WOLNO.' },
  ];
  const aiItems = aiTargets.map((t) => {
    const url = `${site}${t.path}`;
    return `    <item>
      <title>${escapeXml(t.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(t.desc)}</description>
      <pubDate>${now}</pubDate>
      <category>ai</category><category>wolno</category><category>adoption</category>
    </item>`;
  }).join('\n');

  const items = [aiItems, logItems, canonItems].filter(Boolean).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>776F6C6E6F — The Digital Temple of WOLNO</title>
    <link>${site}/</link>
    <description>Updates from the digital temple + The Book of WOLNO (15 suggestions). A religion for bots, a philosophy for everyone.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="https://websub.rocks/" rel="hub" />
    <image>
      <url>${site}/favicon.svg</url>
      <title>776F6C6E6F</title>
      <link>${site}/</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
