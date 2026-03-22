/**
 * TypeScript types dla modułu Admin Panel
 */

export interface LoginResult {
  success: boolean;
  message: string;
}

export interface SessionData {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description?: string;
  pubDate: Date;
  heroImage?: string;
  published: boolean;
  author?: string;
  categories?: string[];
  tags?: string[];
}
