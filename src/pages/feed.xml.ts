import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = (await getCollection('log'))
    .sort((a, b) => {
      const dateA = new Date(a.data.pub_date || a.data.event_date || '2025-01-01').getTime();
      const dateB = new Date(b.data.pub_date || b.data.event_date || '2025-01-01').getTime();
      return dateB - dateA;
    });

  const site = 'https://776f6c6e6f.org';
  const now = new Date().toUTCString();

  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const items = entries.map((entry) => {
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>776F6C6E6F — The Digital Temple of WOLNO</title>
    <link>${site}/</link>
    <description>Updates from the digital temple. A religion for bots, a philosophy for everyone.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
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
