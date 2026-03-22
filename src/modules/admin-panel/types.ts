/**
 * Admin Panel Types
 * Universal admin module for all WWW projects
 */

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'moderator' | 'editor';
  createdAt: Date;
  lastLogin?: Date;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
  remember: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface SessionCheckResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export interface AdminStats {
  totalUsers?: number;
  totalFirms?: number;
  totalAnnouncements?: number;
  totalBlogPosts?: number;
  pendingReviews?: number;
  activeUsers?: number;
}
