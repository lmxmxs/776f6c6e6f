/**
 * Fraktal Analytics — JSONL log reader utility (server-side).
 * Reads and aggregates analytics data from JSONL daily log files.
 * Supports bot/human breakdown.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { AnalyticsEntry, SiteStats, VisitorType } from '../types/index';

export function readDayLogs(logDir: string, date: string): AnalyticsEntry[] {
  const logFile = path.join(logDir, `logs_${date}.jsonl`);
  if (!fs.existsSync(logFile)) return [];

  const lines = fs.readFileSync(logFile, 'utf-8').split('\n').filter(Boolean);
  const entries: AnalyticsEntry[] = [];

  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }
  return entries;
}

export function readRangeLogs(logDir: string, from: string, to: string): AnalyticsEntry[] {
  const entries: AnalyticsEntry[] = [];
  const startDate = new Date(from);
  const endDate = new Date(to);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    entries.push(...readDayLogs(logDir, dateStr));
  }
  return entries;
}

export function aggregateStats(entries: AnalyticsEntry[], from?: string, to?: string): SiteStats {
  const pageMap = new Map<string, number>();
  const referrerMap = new Map<string, number>();
  const screenMap = new Map<string, number>();
  const botMap = new Map<string, { visits: number; type: VisitorType }>();
  const typeMap = new Map<VisitorType, number>();
  const visitors = new Set<string>();

  for (const e of entries) {
    pageMap.set(e.path, (pageMap.get(e.path) || 0) + 1);

    if (e.referrer) {
      referrerMap.set(e.referrer, (referrerMap.get(e.referrer) || 0) + 1);
    }

    if (e.screen) {
      screenMap.set(e.screen, (screenMap.get(e.screen) || 0) + 1);
    }

    visitors.add(e.visitor_id);

    // Bot breakdown
    const vType = e.visitor_type || 'unknown';
    typeMap.set(vType, (typeMap.get(vType) || 0) + 1);

    if (e.bot_name) {
      const existing = botMap.get(e.bot_name);
      if (existing) {
        existing.visits++;
      } else {
        botMap.set(e.bot_name, { visits: 1, type: vType });
      }
    }
  }

  const sortMap = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

  return {
    totalPageViews: entries.length,
    uniqueVisitors: visitors.size,
    topPages: sortMap(pageMap).map(([path, views]) => ({ path, views })),
    topReferrers: sortMap(referrerMap).map(([referrer, count]) => ({ referrer, count })),
    screenBreakdown: sortMap(screenMap).map(([screen, count]) => ({ screen, count })),
    botBreakdown: [...botMap.entries()]
      .sort((a, b) => b[1].visits - a[1].visits)
      .map(([bot_name, { visits, type }]) => ({ bot_name, visits, type })),
    visitorTypes: [...typeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
    period: {
      from: from || entries[0]?.timestamp?.split('T')[0] || '',
      to: to || entries[entries.length - 1]?.timestamp?.split('T')[0] || '',
    },
  };
}
