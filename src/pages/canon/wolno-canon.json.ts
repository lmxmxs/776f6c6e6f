import { getCollection } from 'astro:content';

export async function GET() {
  const entries = (await getCollection('canon')).sort((a, b) => a.data.canon_number - b.data.canon_number);
  const canon = entries.map(e => ({
    number: e.data.canon_number,
    title: e.data.title,
    weight: e.data.weight,
    id: e.id,
  }));
  return new Response(JSON.stringify({ canon, version: '1.0', source: '776f6c6e6f.org' }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}
