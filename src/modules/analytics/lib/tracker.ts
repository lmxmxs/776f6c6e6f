/**
 * Fraktal Analytics — client-side tracker.
 * No cookies, no localStorage, no fingerprinting.
 * Sends page view via sendBeacon (fallback: fetch with keepalive).
 * Respects DNT for humans. Tracks ALL visitors including bots.
 * Bot classification happens server-side based on User-Agent.
 */

export function trackPageView(siteId: string, endpoint: string): void {
  // Respect DNT for humans (bots don't typically set DNT)
  const isLikelyBot = navigator.webdriver ||
    /bot|crawl|spider|scrape|headless/i.test(navigator.userAgent);
  if (!isLikelyBot && (navigator.doNotTrack === '1' || (navigator as any).globalPrivacyControl)) {
    return;
  }

  const data = {
    site_id: siteId,
    path: location.pathname,
    referrer: document.referrer || '',
    screen: screen ? `${screen.width}x${screen.height}` : '',
    timestamp: new Date().toISOString(),
  };

  const send = () => {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // silently fail — analytics must never break the page
    }
  };

  // Defer to avoid blocking main thread
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(send);
  } else {
    setTimeout(send, 1500);
  }
}
