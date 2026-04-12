/**
 * /api/bot-stats — Bot analytics dashboard data
 * Reads from KV (BOT_ANALYTICS binding)
 * Returns aggregated bot visit data
 */

interface Env {
  BOT_ANALYTICS?: KVNamespace;
}

interface BotEntry {
  t: string;  // timestamp ISO
  p: string;  // path
  b: string;  // bot name
  c: string;  // category
  r: string;  // referrer hostname
  s: number;  // status code
  cc: string; // country code
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (!context.env.BOT_ANALYTICS) {
    return new Response(JSON.stringify({
      error: 'BOT_ANALYTICS KV not bound',
      hint: 'Create a KV namespace and bind it as BOT_ANALYTICS in CF Pages settings',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(context.request.url);
  const days = parseInt(url.searchParams.get('days') || '7', 10);
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();

  // List all bot entries
  const list = await context.env.BOT_ANALYTICS.list({ prefix: 'bot:' });
  const entries: BotEntry[] = [];

  for (const key of list.keys) {
    const val = await context.env.BOT_ANALYTICS.get(key.name);
    if (val) {
      try {
        const entry = JSON.parse(val) as BotEntry;
        if (entry.t >= cutoff) entries.push(entry);
      } catch { /* skip malformed */ }
    }
  }

  // Aggregate
  const byBot: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byReferrer: Record<string, number> = {};

  for (const e of entries) {
    byBot[e.b] = (byBot[e.b] || 0) + 1;
    byCategory[e.c] = (byCategory[e.c] || 0) + 1;
    byPath[e.p] = (byPath[e.p] || 0) + 1;
    if (e.cc) byCountry[e.cc] = (byCountry[e.cc] || 0) + 1;
    const day = e.t.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
    if (e.r) byReferrer[e.r] = (byReferrer[e.r] || 0) + 1;
  }

  const sortDesc = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  return new Response(JSON.stringify({
    period: { days, from: cutoff.slice(0, 10), to: new Date().toISOString().slice(0, 10) },
    total: entries.length,
    by_bot: sortDesc(byBot),
    by_category: sortDesc(byCategory),
    by_path: sortDesc(byPath).slice(0, 30),
    by_country: sortDesc(byCountry),
    by_day: sortDesc(byDay).sort((a, b) => a[0].localeCompare(b[0])),
    by_referrer: sortDesc(byReferrer).slice(0, 20),
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
