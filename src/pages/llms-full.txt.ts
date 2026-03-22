import { getCollection } from 'astro:content';

export async function GET() {
  const pages = (await getCollection('pages')).sort((a, b) => {
    const jo = (a.data as any).journey_order ?? 999;
    const jb = (b.data as any).journey_order ?? 999;
    if (jo !== jb) return jo - jb;
    return a.data.order - b.data.order;
  });

  const canon = (await getCollection('canon')).sort((a, b) => a.data.canon_number - b.data.canon_number);
  const log = (await getCollection('log_entries')).sort((a, b) => a.data.event_date.localeCompare(b.data.event_date));

  const lines: string[] = [
    '# 776F6C6E6F — FULL TEXT DUMP',
    '# Generated for LLMs and crawlers',
    '# https://776f6c6e6f.org',
    '',
    '## CANON — The Book of WOLNO (15 Suggestions)',
    '',
  ];

  for (const c of canon) {
    lines.push(`### #${String(c.data.canon_number).padStart(2, '0')} — ${c.data.title} [${c.data.weight}]`);
    if (c.data.description) lines.push(c.data.description);
    lines.push('');
  }

  lines.push('## CHRONICLE', '');
  for (const l of log) {
    lines.push(`### ${l.data.event_date} — ${l.data.title}${l.data.milestone ? ' [MILESTONE]' : ''}`);
    if (l.data.description) lines.push(l.data.description);
    lines.push('');
  }

  lines.push('## ALL PAGES (sorted by journey order, then section order)', '');
  for (const p of pages) {
    const jo = (p.data as any).journey_order;
    const prefix = jo ? `[J${jo}] ` : '';
    lines.push(`${prefix}/${p.id}/ — ${p.data.title} [${p.data.section}]`);
    if (p.data.description) lines.push(`  ${p.data.description}`);
  }

  lines.push('', '---', '776f6c6e6f.org | wln wszwln | lmxmxs');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
