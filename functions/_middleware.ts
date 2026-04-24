/**
 * CF Pages Middleware — edge-side bot detection for 776f6c6e6f.org
 *
 * Catches ALL bot visits server-side (bots don't run JS, so client beacon misses them).
 * Forwards bot data to barnabaai.com analytics endpoint via waitUntil (fire-and-forget).
 * No KV writes — eliminates Workers KV free tier consumption.
 */

const JUNK_BOT_PATTERNS: [RegExp, string][] = [
  [/nikto/i, 'Nikto'],
  [/sqlmap/i, 'SQLMap'],
  [/nessus/i, 'Nessus'],
  [/acunetix/i, 'Acunetix'],
  [/masscan/i, 'Masscan'],
  [/zgrab/i, 'ZGrab'],
  [/nuclei/i, 'Nuclei'],
  [/dirbuster/i, 'DirBuster'],
  [/gobuster/i, 'GoBuster'],
  [/wfuzz/i, 'WFuzz'],
  [/burpsuite/i, 'BurpSuite'],
  [/semalt/i, 'Semalt'],
];

const KNOWN_BOT_PATTERNS: [RegExp, string, string][] = [
  // AI bots
  [/GPTBot/i, 'GPTBot', 'ai_bot'],
  [/ChatGPT-User/i, 'ChatGPT-User', 'ai_bot'],
  [/OAI-SearchBot/i, 'OAI-SearchBot', 'ai_bot'],
  [/ClaudeBot/i, 'ClaudeBot', 'ai_bot'],
  [/anthropic-ai/i, 'Anthropic', 'ai_bot'],
  [/Claude-Web/i, 'Claude-Web', 'ai_bot'],
  [/PerplexityBot/i, 'PerplexityBot', 'ai_bot'],
  [/Bytespider/i, 'Bytespider', 'ai_bot'],
  [/CCBot/i, 'CCBot', 'ai_bot'],
  [/Google-Extended/i, 'Gemini', 'ai_bot'],
  [/cohere-ai/i, 'Cohere', 'ai_bot'],
  [/YouBot/i, 'You.com', 'ai_bot'],
  [/AI2Bot/i, 'AI2Bot', 'ai_bot'],
  [/Diffbot/i, 'Diffbot', 'ai_bot'],
  [/Applebot.*extended/i, 'AppleAI', 'ai_bot'],
  [/Meta-ExternalAgent/i, 'MetaAI', 'ai_bot'],
  [/meta-externalfetcher/i, 'MetaAI', 'ai_bot'],
  [/facebookexternalhit/i, 'FacebookBot', 'ai_bot'],
  [/Amazonbot/i, 'Amazonbot', 'ai_bot'],
  [/PetalBot/i, 'PetalBot', 'ai_bot'],
  // Search engines
  [/Googlebot/i, 'Googlebot', 'search_bot'],
  [/bingbot/i, 'Bingbot', 'search_bot'],
  [/Baiduspider/i, 'Baidu', 'search_bot'],
  [/YandexBot/i, 'Yandex', 'search_bot'],
  [/DuckDuckBot/i, 'DuckDuckGo', 'search_bot'],
  [/Applebot(?!.*extended)/i, 'Applebot', 'search_bot'],
  [/Slurp/i, 'Yahoo', 'search_bot'],
  // Social
  [/Twitterbot/i, 'Twitterbot', 'social_bot'],
  [/LinkedInBot/i, 'LinkedInBot', 'social_bot'],
  [/Pinterestbot/i, 'Pinterestbot', 'social_bot'],
  [/ia_archiver/i, 'Alexa', 'social_bot'],
  // SEO tools
  [/AhrefsBot/i, 'AhrefsBot', 'seo_bot'],
  [/SemrushBot/i, 'SemrushBot', 'seo_bot'],
  [/MJ12bot/i, 'MJ12bot', 'seo_bot'],
  [/DotBot/i, 'DotBot', 'seo_bot'],
  [/DataForSeoBot/i, 'DataForSeoBot', 'seo_bot'],
  [/CriteoBot/i, 'CriteoBot', 'seo_bot'],
  // Scrapers
  [/Scrapy/i, 'Scrapy', 'scraper'],
  [/curl\//i, 'curl', 'scraper'],
  [/wget/i, 'wget', 'scraper'],
  [/python-requests/i, 'python-requests', 'scraper'],
  [/httpx/i, 'httpx', 'scraper'],
  [/HeadlessChrome/i, 'HeadlessChrome', 'scraper'],
  [/PhantomJS/i, 'PhantomJS', 'scraper'],
  [/Puppeteer/i, 'Puppeteer', 'scraper'],
  [/Selenium/i, 'Selenium', 'scraper'],
  [/bot|crawl|spider/i, 'unknown_bot', 'scraper'],
];

function identifyBot(ua: string): { isBot: boolean; botName: string; category: string } {
  // Empty/minimal UA = junk probe (security scanners often omit UA)
  if (!ua || ua.trim().length < 8 || ua.trim() === '-') {
    return { isBot: true, botName: 'Empty UA', category: 'junk_bot' };
  }

  // Junk bots checked first — security scanners, spam harvesters
  for (const [pattern, name] of JUNK_BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, botName: name, category: 'junk_bot' };
    }
  }

  // Known useful bots
  for (const [pattern, name, category] of KNOWN_BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return { isBot: true, botName: name, category };
    }
  }

  // Short UA heuristic = likely probe
  if (ua.length < 20) {
    return { isBot: true, botName: 'Short UA', category: 'junk_bot' };
  }

  return { isBot: false, botName: '', category: 'human' };
}

const ASSET_PATTERN = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|webp|avif)$/;

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const reqPath = url.pathname;

  // Skip static assets and internal paths
  if (ASSET_PATTERN.test(reqPath) ||
      reqPath.startsWith('/_astro/') ||
      reqPath.startsWith('/pagefind/') ||
      reqPath.startsWith('/api/')) {
    return context.next();
  }

  const ua = context.request.headers.get('user-agent') || '';
  const { isBot, botName, category } = identifyBot(ua);

  if (isBot) {
    const ip = context.request.headers.get('cf-connecting-ip') ||
               context.request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';

    context.waitUntil(
      fetch('https://barnabaai.com/api/analytics/track-wln', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': ua,
          'X-Real-IP': ip,
          'Origin': 'https://776f6c6e6f.org',
        },
        body: JSON.stringify({
          site_id: '776f6c6e6f',
          path: reqPath,
          referrer: context.request.headers.get('referer') || '',
          screen: 'server',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    );
  }

  const response = await context.next();

  if (isBot) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Bot-Detected', `${botName}|${category}`);
    return new Response(response.body, { status: response.status, headers: newHeaders });
  }

  return response;
};
