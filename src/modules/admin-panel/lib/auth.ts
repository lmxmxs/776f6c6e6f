// @PATH: /src/lib/admin/auth.ts
// @PROJECT: 112358 (Fraktale Galeria)
// Admin authentication utilities

import type { AstroCookies } from 'astro';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fraktale2024';
const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface AdminSession {
  authenticated: boolean;
  expiresAt: number;
}

/**
 * Verify admin password
 */
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Create admin session
 */
export function createSession(cookies: AstroCookies): void {
  const session: AdminSession = {
    authenticated: true,
    expiresAt: Date.now() + SESSION_DURATION
  };

  cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000
  });
}

/**
 * Check if admin is authenticated
 */
export function isAuthenticated(cookies: AstroCookies): boolean {
  const sessionCookie = cookies.get(SESSION_COOKIE);

  if (!sessionCookie) {
    return false;
  }

  try {
    const session: AdminSession = JSON.parse(sessionCookie.value);

    if (!session.authenticated || Date.now() > session.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Destroy admin session
 */
export function destroySession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, {
    path: '/'
  });
}

/**
 * Require authentication (redirect to login if not authenticated)
 */
export function requireAuth(cookies: AstroCookies, redirect: (url: string) => Response): Response | null {
  if (!isAuthenticated(cookies)) {
    return redirect('/admin/login');
  }
  return null;
}
