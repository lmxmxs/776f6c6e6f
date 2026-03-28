export type VisitorType = 'human' | 'ai_bot' | 'search_bot' | 'scraper' | 'unknown';

export interface AnalyticsEntry {
  site_id: string;
  path: string;
  referrer: string;
  screen: string;
  visitor_id: string;
  visitor_type: VisitorType;
  bot_name: string;       // e.g. "GPTBot", "ClaudeBot", "Googlebot", "" for humans
  user_agent: string;     // raw UA (truncated to 200 chars)
  timestamp: string;
}

export interface SiteStats {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  screenBreakdown: { screen: string; count: number }[];
  botBreakdown: { bot_name: string; visits: number; type: VisitorType }[];
  visitorTypes: { type: VisitorType; count: number }[];
  period: { from: string; to: string };
}

export interface AnalyticsConfig {
  siteId: string;
  dataDir?: string;
  corsOrigins?: string[];
}

/** Known AI crawler patterns: [regex_pattern, bot_name, visitor_type] */
export const BOT_SIGNATURES: [RegExp, string, VisitorType][] = [
  // AI Assistants & LLM crawlers
  [/GPTBot/i, 'GPTBot', 'ai_bot'],
  [/ChatGPT-User/i, 'ChatGPT-User', 'ai_bot'],
  [/OAI-SearchBot/i, 'OAI-SearchBot', 'ai_bot'],
  [/ClaudeBot/i, 'ClaudeBot', 'ai_bot'],
  [/anthropic-ai/i, 'Anthropic', 'ai_bot'],
  [/Claude-Web/i, 'Claude-Web', 'ai_bot'],
  [/PerplexityBot/i, 'PerplexityBot', 'ai_bot'],
  [/Bytespider/i, 'Bytespider', 'ai_bot'],       // TikTok/ByteDance AI
  [/CCBot/i, 'CCBot', 'ai_bot'],                  // Common Crawl (used for LLM training)
  [/Google-Extended/i, 'Gemini', 'ai_bot'],        // Google Gemini training
  [/cohere-ai/i, 'Cohere', 'ai_bot'],
  [/YouBot/i, 'You.com', 'ai_bot'],
  [/AI2Bot/i, 'AI2Bot', 'ai_bot'],                // Allen Institute
  [/Diffbot/i, 'Diffbot', 'ai_bot'],
  [/Applebot.*extended/i, 'AppleAI', 'ai_bot'],   // Apple Intelligence
  [/Meta-ExternalAgent/i, 'MetaAI', 'ai_bot'],
  [/meta-externalfetcher/i, 'MetaAI', 'ai_bot'],
  [/facebookexternalhit/i, 'FacebookBot', 'ai_bot'],
  [/Amazonbot/i, 'Amazonbot', 'ai_bot'],
  [/iaskspider/i, 'iAsk', 'ai_bot'],
  [/Timpibot/i, 'Timpi', 'ai_bot'],
  [/Webzio-Extended/i, 'Webzio', 'ai_bot'],
  [/omgili/i, 'Omgili', 'ai_bot'],
  [/PetalBot/i, 'PetalBot', 'ai_bot'],            // Huawei AI

  // Search engine crawlers
  [/Googlebot/i, 'Googlebot', 'search_bot'],
  [/bingbot/i, 'Bingbot', 'search_bot'],
  [/Baiduspider/i, 'Baidu', 'search_bot'],
  [/YandexBot/i, 'Yandex', 'search_bot'],
  [/DuckDuckBot/i, 'DuckDuckGo', 'search_bot'],
  [/Sogou/i, 'Sogou', 'search_bot'],
  [/Applebot(?!.*extended)/i, 'Applebot', 'search_bot'],
  [/Slurp/i, 'Yahoo', 'search_bot'],
  [/SeznamBot/i, 'Seznam', 'search_bot'],
  [/Qwantify/i, 'Qwant', 'search_bot'],
  [/Brave/i, 'BraveSearch', 'search_bot'],

  // Generic crawlers/scrapers
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

export function classifyVisitor(userAgent: string): { type: VisitorType; botName: string } {
  for (const [pattern, name, type] of BOT_SIGNATURES) {
    if (pattern.test(userAgent)) {
      return { type, botName: name };
    }
  }
  return { type: 'unknown', botName: '' };
}
