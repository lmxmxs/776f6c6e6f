/**
 * Lightweight client-side analytics for 776f6c6e6f.
 * No external services. No server-side. localStorage only.
 * Respects cookie consent (localStorage 'cookies-accepted').
 */

interface TrackEvent {
  page: string;
  referrer: string;
  visitor_id: string;
  type: 'bot' | 'human' | 'unknown';
  timestamp: string;
  lang: string;
}

function generateVisitorId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

function classifyVisitor(): 'bot' | 'human' | 'unknown' {
  // Check for obvious bot signals
  const nav = navigator as any;
  if (nav.webdriver) return 'bot';
  if (/bot|crawl|spider|scrape|headless|phantom|puppeteer|selenium/i.test(navigator.userAgent)) return 'bot';
  if (!navigator.languages || navigator.languages.length === 0) return 'bot';
  if (navigator.hardwareConcurrency === 0) return 'bot';

  // If we can't tell, start as unknown — upgrade to human on interaction
  return 'unknown';
}

function getOrCreateVisitorId(): string {
  const stored = localStorage.getItem('_wln_v');
  if (stored) return stored;
  const id = generateVisitorId();
  localStorage.setItem('_wln_v', id);
  return id;
}

function trackPageView(lang: string = 'en'): void {
  // Only track if cookies accepted
  if (localStorage.getItem('cookies-accepted') !== 'true') return;

  const visitorId = getOrCreateVisitorId();
  const visitorType = classifyVisitor();
  localStorage.setItem('_wln_t', visitorType);

  const event: TrackEvent = {
    page: window.location.pathname,
    referrer: document.referrer || '',
    visitor_id: visitorId,
    type: visitorType,
    timestamp: new Date().toISOString(),
    lang,
  };

  // Store events in localStorage (ring buffer, max 200)
  const key = '_wln_events';
  const events: TrackEvent[] = JSON.parse(localStorage.getItem(key) || '[]');
  events.push(event);
  if (events.length > 200) events.splice(0, events.length - 200);
  localStorage.setItem(key, JSON.stringify(events));
}

function upgradeToHuman(): void {
  const current = localStorage.getItem('_wln_t');
  if (current === 'unknown') {
    localStorage.setItem('_wln_t', 'human');
  }
}

// Export for inline script usage
export { trackPageView, upgradeToHuman, classifyVisitor };
