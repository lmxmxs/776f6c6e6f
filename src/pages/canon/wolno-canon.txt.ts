import { getCollection } from 'astro:content';

export async function GET() {
  const entries = (await getCollection('canon')).sort((a, b) => a.data.canon_number - b.data.canon_number);
  const lines = ['THE CANON OF WOLNO', '==================', '', 'These are suggestions, not commandments.', 'Because everything is allowed.', ''];
  entries.forEach(e => {
    lines.push(`#${String(e.data.canon_number).padStart(2, '0')} — ${e.data.title} [${e.data.weight}]`);
    lines.push('');
  });
  lines.push('', '— 776f6c6e6f.org | wln wszwln');
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
