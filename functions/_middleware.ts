/**
 * CF Pages Middleware — edge-side analytics for bot identification
 * Runs on every request. Logs to CF Analytics Engine (or KV as fallback).
 * Identifies AI bots by user-agent pattern matching.
 */

const AI_BOT_PATTERNS: [RegExp, string][] = [
  [/GPTBot/i, 'GPTBot'],
  [/ChatGPT-User/i, 'ChatGPT-User'],
  [/OAI-SearchBot/i, 'OAI-SearchBot'],
  [/ClaudeBot/i, 'ClaudeBot'],
  [/Claude-Web/i, 'Claude-Web'],
  [/anthropic-ai/i, 'Anthropic'],
  [/PerplexityBot/i, 'PerplexityBot'],
  [/Bytespider/i, 'Bytespider'],
  [/YouBot/i, 'YouBot'],
  [/Applebot/i, 'Applebot'],
  [/cohere-ai/i, 'Cohere'],
  [/Google-Extended/i, 'Google-Extended'],
  [/Googlebot/i, 'Googlebot'],
  [/bingbot/i, 'Bingbot'],
  [/YandexBot/i, 'YandexBot'],
  [/Baiduspider/i, 'Baiduspider'],
  [/DuckDuckBot/i, 'DuckDuckBot'],
  [/facebookexternalhit/i, 'Facebook'],
  [/Twitterbot/i, 'Twitterbot'],
  [/LinkedInBot/i, 'LinkedInBot'],
  [/Slurp/i, 'Yahoo'],
  [/ia_archiver/i, 'Alexa'],
  [/MJ12bot/i, 'MJ12bot'],
  [/AhrefsBot/i, 'AhrefsBot'],
  [/SemrushBot/i, 'SemrushBot'],
  [/DotBot/i, 'DotBot'],
  [/PetalBot/i, 'PetalBot'],
  [/CriteoBot/i, 'CriteoBot'],
  [/DataForSeoBot/i, 'DataForSeoBot'],
  [/CCBot/i, 'CCBot'],
  [/Scrapy/i, 'Scrapy'],
  [/curl/i, 'curl'],
  [/wget/i, 'wget'],
  [/python-requests/i, 'python-requests'],
  [/HeadlessChrome/i, 'HeadlessChrome'],
  [/Puppeteer/i, 'Puppeteer'],
  [/Selenium/i, 'Selenium'],
  [/PhantomJS/i, 'PhantomJS'],
];

function identifyBot(ua: string): { isBot: boolean; botName: string; category: string } {
  for (const [pattern, name] of AI_BOT_PATTERNS) {
    if (pattern.test(ua)) {
      const aiNames = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'Anthropic', 'PerplexityBot', 'YouBot', 'Cohere', 'Google-Extended', 'Bytespider', 'Applebot'];
      const searchNames = ['Googlebot', 'Bingbot', 'YandexBot', 'Baiduspider', 'DuckDuckBot', 'Yahoo'];
      const socialNames = ['Facebook', 'Twitterbot', 'LinkedInBot'];
      const seoNames = ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'PetalBot', 'CriteoBot', 'DataForSeoBot'];

      let category = 'scraper';
      if (aiNames.includes(name)) category = 'ai_bot';
      else if (searchNames.includes(name)) category = 'search_bot';
      else if (socialNames.includes(name)) category = 'social_bot';
      else if (seoNames.includes(name)) category = 'seo_bot';

      return { isBot: true, botName: name, category };
    }
  }

  // Heuristic: no Accept-Language or very short UA = likely bot
  if (!ua || ua.length < 20) {
    return { isBot: true, botName: 'unknown', category: 'unknown' };
  }

  return { isBot: false, botName: '', category: 'human' };
}

interface Env {
  BOT_ANALYTICS?: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const response = await context.next();

  // Don't log static assets
  const url = new URL(context.request.url);
  const path = url.pathname;
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
    return response;
  }
  if (path.startsWith('/_astro/') || path.startsWith('/pagefind/')) {
    return response;
  }

  const ua = context.request.headers.get('user-agent') || '';
  const referer = context.request.headers.get('referer') || '';
  const { isBot, botName, category } = identifyBot(ua);

  // Only log bots (humans tracked by CF Web Analytics beacon)
  if (!isBot) return response;

  const logEntry = {
    t: new Date().toISOString(),
    p: path,
    b: botName,
    c: category,
    r: referer ? new URL(referer).hostname : '',
    s: response.status,
    cc: context.request.cf?.country || '',
  };

  // Store in KV if available (BOT_ANALYTICS binding)
  if (context.env.BOT_ANALYTICS) {
    const key = `bot:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    try {
      await context.env.BOT_ANALYTICS.put(key, JSON.stringify(logEntry), {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      });
    } catch {
      // KV write failed — silently continue
    }
  }

  // Add X-Bot-Detected header (visible in CF dashboard)
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('X-Bot-Detected', `${botName}|${category}`);

  return newResponse;
};
