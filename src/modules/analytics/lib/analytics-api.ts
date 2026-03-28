/**
 * Fraktal Analytics — server-side API handler (SSR only).
 *
 * Privacy-focused: daily-salted SHA-256 visitor hash, no cookies, no PII.
 * Bot-aware: classifies AI bots, search bots, scrapers — tracks them all.
 * Stores JSONL logs: one file per day.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { AnalyticsEntry, AnalyticsConfig } from '../types/index';
import { classifyVisitor } from '../types/index';

export async function handleTrackRequest(
  request: Request,
  clientAddress: string,
  config: AnalyticsConfig
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // CORS for cross-origin beacons (e.g. static sites sending to SSR collector)
  if (config.corsOrigins?.length) {
    const origin = request.headers.get('origin') || '';
    if (config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type';
    }
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // Respect DNT header — but only for humans.
  // Bots don't send DNT, and we want to track them regardless.
  const dnt = request.headers.get('dnt');
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const { type: visitorType, botName } = classifyVisitor(userAgent);
  const isBot = visitorType !== 'human' && visitorType !== 'unknown';

  if (dnt === '1' && !isBot) {
    return new Response(JSON.stringify({ status: 'ok', tracked: false, reason: 'dnt' }), {
      status: 200,
      headers,
    });
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch {
      // ignore parse errors (some beacon types send empty body)
    }

    // Privacy-focused visitor hash: daily salt ensures no long-term profiles
    const dailySalt = new Date().toISOString().split('T')[0];
    const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    const visitorHash = crypto
      .createHash('sha256')
      .update(ip + userAgent + dailySalt)
      .digest('hex')
      .substring(0, 12);

    const entry: AnalyticsEntry = {
      site_id: config.siteId,
      path: String(body.path || '/'),
      referrer: String(body.referrer || ''),
      screen: String(body.screen || ''),
      visitor_id: visitorHash,
      visitor_type: visitorType,
      bot_name: botName,
      user_agent: userAgent.substring(0, 200),
      timestamp: new Date().toISOString(),
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const logDir = path.join(config.dataDir || path.join(process.cwd(), 'data'), 'analytics');
    const logFile = path.join(logDir, `logs_${dateStr}.jsonl`);

    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(entry) + '\n');

    return new Response(JSON.stringify({ status: 'ok', tracked: true, visitor_type: visitorType }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[Fraktal Analytics] Write error:', error);
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers,
    });
  }
}

/**
 * Server-side log from raw request (for tracking bot crawls that don't execute JS).
 * Call this from middleware or SSR page rendering to capture bot visits.
 */
export async function logServerSideVisit(
  request: Request,
  clientAddress: string,
  config: AnalyticsConfig
): Promise<void> {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const { type: visitorType, botName } = classifyVisitor(userAgent);

  // Only log bots server-side (humans are tracked via client JS)
  if (visitorType === 'human' || visitorType === 'unknown') return;

  const dailySalt = new Date().toISOString().split('T')[0];
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  const visitorHash = crypto
    .createHash('sha256')
    .update(ip + userAgent + dailySalt)
    .digest('hex')
    .substring(0, 12);

  const url = new URL(request.url);
  const entry: AnalyticsEntry = {
    site_id: config.siteId,
    path: url.pathname,
    referrer: request.headers.get('referer') || '',
    screen: '',
    visitor_id: visitorHash,
    visitor_type: visitorType,
    bot_name: botName,
    user_agent: userAgent.substring(0, 200),
    timestamp: new Date().toISOString(),
  };

  const dateStr = new Date().toISOString().split('T')[0];
  const logDir = path.join(config.dataDir || path.join(process.cwd(), 'data'), 'analytics');
  const logFile = path.join(logDir, `logs_${dateStr}.jsonl`);

  try {
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
  } catch (error) {
    console.error('[Fraktal Analytics] Server-side log error:', error);
  }
}
