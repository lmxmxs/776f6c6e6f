/**
 * Publikator API - Authentication & Rate Limiting
 * Wspolne utility dla endpointow /api/publikator/*
 */

// Rate limiting store (in-memory, per-process)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function authenticateRequest(request: Request): { authorized: boolean; error?: string } {
  const apiKey = import.meta.env.PUBLIKATOR_API_KEY;

  if (!apiKey) {
    return { authorized: false, error: 'PUBLIKATOR_API_KEY not configured' };
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return { authorized: false, error: 'Missing Authorization header' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (token !== apiKey) {
    return { authorized: false, error: 'Invalid API key' };
  }

  return { authorized: true };
}

export function checkRateLimit(
  clientId: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed: entry.count <= maxRequests,
    remaining,
    resetTime: entry.resetTime
  };
}

export function logOperation(operation: string, details: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, operation, ...details });
  console.log(`[Publikator] ${logEntry}`);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ąćęłńóśźż]/g, (char) => {
      const map: Record<string, string> = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
