/**
 * /api/bot-stats — Bot analytics info endpoint
 *
 * Bot tracking migrated from KV to Fraktal Analytics (JSONL via barnabaai.com).
 * Data is visible in Statystyka:8034 filtered by site_id=776f6c6e6f.
 */

export const onRequest: PagesFunction = async () => {
  return new Response(JSON.stringify({
    status: 'migrated',
    message: 'Bot tracking moved to Fraktal Analytics. Data available at Statystyka:8034 (site: 776f6c6e6f).',
    storage: 'JSONL via barnabaai.com/api/analytics/track-wln',
    kv: 'disabled — no longer used (eliminates KV free tier consumption)',
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
