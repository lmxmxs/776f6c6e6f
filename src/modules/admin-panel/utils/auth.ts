/**
 * Authentication Utilities
 * Universal admin auth helpers with secure password hashing
 * Uses SQLite for persistent storage
 *
 * @PATH: /src/modules/admin-panel/utils/auth.ts
 * @PROJECT: barnabaai
 */

import type { User, Session } from '../types';
import crypto from 'crypto';
import * as db from '../../../lib/db/admin';

// Password hashing using scrypt (secure, built-in to Node.js)
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  // Support legacy plaintext passwords during migration
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, hash] = storedHash.split(':');
  const derivedHash = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedHash, 'hex'));
}

// Rate limiting constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Initialize default admin user if not exists
const DEFAULT_PASSWORD = 'krokiet';
const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@barnaba.ai',
  username: 'barszcz',
  role: 'admin' as const,
};

// Check and create default admin on module load
const existingAdmin = db.getUserById(DEFAULT_ADMIN.id);
if (!existingAdmin) {
  try {
    db.createUser({
      id: DEFAULT_ADMIN.id,
      email: DEFAULT_ADMIN.email,
      username: DEFAULT_ADMIN.username,
      password_hash: hashPassword(DEFAULT_PASSWORD),
      role: DEFAULT_ADMIN.role,
    });
    console.log('[AUTH] Default admin user created');
  } catch (e) {
    // User might already exist with different ID - check by email
    const byEmail = db.getUserByEmail(DEFAULT_ADMIN.email);
    if (!byEmail) {
      console.error('[AUTH] Failed to create default admin:', e);
    }
  }
}

/**
 * Generate random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Convert DB user to API user format
 */
function dbUserToUser(dbUser: db.DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    role: dbUser.role,
    createdAt: new Date(dbUser.created_at),
  };
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  // Find user by email or username
  let dbUser = db.getUserByEmail(emailOrUsername);

  if (!dbUser) {
    dbUser = db.getUserByUsername(emailOrUsername);
  }

  if (!dbUser) {
    return null;
  }

  // Verify password with secure comparison
  if (!verifyPassword(password, dbUser.password_hash)) {
    return null;
  }

  return dbUserToUser(dbUser);
}

/**
 * Create session for user
 */
export function createSession(userId: string, remember: boolean = false): Session {
  const token = generateToken();
  const expiresIn = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 24 hours
  const expiresAt = new Date(Date.now() + expiresIn);

  db.createSession({
    token,
    user_id: userId,
    expires_at: expiresAt,
    remember,
  });

  return {
    userId,
    token,
    expiresAt,
    remember,
  };
}

/**
 * Verify session token
 */
export function verifySession(token: string): Session | null {
  const dbSession = db.getSession(token);

  if (!dbSession) {
    return null;
  }

  const expiresAt = new Date(dbSession.expires_at);

  // Check if expired
  if (expiresAt < new Date()) {
    db.deleteSession(token);
    return null;
  }

  return {
    userId: dbSession.user_id,
    token: dbSession.token,
    expiresAt,
    remember: dbSession.remember === 1,
  };
}

/**
 * Get user by session token
 */
export function getUserBySession(token: string): User | null {
  const session = verifySession(token);

  if (!session) {
    return null;
  }

  const dbUser = db.getUserById(session.userId);

  if (!dbUser) {
    return null;
  }

  return dbUserToUser(dbUser);
}

/**
 * Delete session (logout)
 */
export function deleteSession(token: string): boolean {
  return db.deleteSession(token);
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): Omit<User, 'passwordHash'>[] {
  return db.getAllUsers().map(dbUserToUser);
}

/**
 * Get user by ID
 */
export function getUserById(id: string): Omit<User, 'passwordHash'> | null {
  const dbUser = db.getUserById(id);
  return dbUser ? dbUserToUser(dbUser) : null;
}

/**
 * Create new user
 */
export function createUser(userData: {
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'moderator' | 'editor';
}): { success: boolean; error?: string; user?: Omit<User, 'passwordHash'> } {
  // Check if email exists
  if (db.getUserByEmail(userData.email)) {
    return { success: false, error: 'Email already exists' };
  }

  // Check if username exists
  if (db.getUserByUsername(userData.username)) {
    return { success: false, error: 'Username already exists' };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: userData.email,
    username: userData.username,
    password_hash: hashPassword(userData.password),
    role: userData.role,
  };

  try {
    db.createUser(newUser);
    const createdUser = db.getUserById(newUser.id);
    return { success: true, user: createdUser ? dbUserToUser(createdUser) : undefined };
  } catch (e) {
    console.error('[AUTH] Failed to create user:', e);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  updates: Partial<{ email: string; username: string; role: 'admin' | 'moderator' | 'editor' }>
): { success: boolean; error?: string; user?: Omit<User, 'passwordHash'> } {
  const existingUser = db.getUserById(id);

  if (!existingUser) {
    return { success: false, error: 'User not found' };
  }

  // Check email uniqueness if changing
  if (updates.email && updates.email !== existingUser.email) {
    if (db.getUserByEmail(updates.email)) {
      return { success: false, error: 'Email already exists' };
    }
  }

  // Check username uniqueness if changing
  if (updates.username && updates.username !== existingUser.username) {
    if (db.getUserByUsername(updates.username)) {
      return { success: false, error: 'Username already exists' };
    }
  }

  try {
    db.updateUser(id, updates);
    const updatedUser = db.getUserById(id);
    return { success: true, user: updatedUser ? dbUserToUser(updatedUser) : undefined };
  } catch (e) {
    console.error('[AUTH] Failed to update user:', e);
    return { success: false, error: 'Failed to update user' };
  }
}

/**
 * Delete user
 */
export function deleteUser(id: string): { success: boolean; error?: string } {
  const user = db.getUserById(id);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Don't allow deleting the last admin
  if (user.role === 'admin' && db.countAdmins() <= 1) {
    return { success: false, error: 'Cannot delete the last admin' };
  }

  try {
    // Delete all sessions for this user first
    db.deleteUserSessions(id);
    // Delete user
    db.deleteUser(id);
    return { success: true };
  } catch (e) {
    console.error('[AUTH] Failed to delete user:', e);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Change user password
 */
export function changeUserPassword(id: string, newPassword: string): { success: boolean; error?: string } {
  const user = db.getUserById(id);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  try {
    db.updateUser(id, { password_hash: hashPassword(newPassword) });
    return { success: true };
  } catch (e) {
    console.error('[AUTH] Failed to change password:', e);
    return { success: false, error: 'Failed to change password' };
  }
}

/**
 * Clean expired sessions (call periodically)
 */
export function cleanExpiredSessions(): number {
  return db.cleanExpiredSessions();
}

// ===== RATE LIMITING =====

/**
 * Check if IP/email is rate limited
 */
export function isRateLimited(identifier: string): {
  limited: boolean;
  remainingAttempts?: number;
  lockedUntil?: Date;
} {
  const attempt = db.getLoginAttempt(identifier);

  if (!attempt) {
    return { limited: false, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if currently locked
  if (attempt.locked_until) {
    const lockedUntil = new Date(attempt.locked_until);
    if (lockedUntil > new Date()) {
      return {
        limited: true,
        lockedUntil,
      };
    }
  }

  // Check if attempts window expired
  const firstAttempt = new Date(attempt.first_attempt);
  const windowExpired = Date.now() - firstAttempt.getTime() > ATTEMPT_WINDOW;

  if (windowExpired) {
    db.clearLoginAttempts(identifier);
    return { limited: false, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
    db.lockAccount(identifier, lockedUntil);
    return {
      limited: true,
      lockedUntil,
    };
  }

  return {
    limited: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count,
  };
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(identifier: string): void {
  db.recordLoginAttempt(identifier);
}

/**
 * Clear login attempts (after successful login)
 */
export function clearLoginAttempts(identifier: string): void {
  db.clearLoginAttempts(identifier);
}

// ===== PASSWORD RESET =====

/**
 * Request password reset
 */
export function requestPasswordReset(email: string): string | null {
  // Find user
  const user = db.getUserByEmail(email);

  if (!user) {
    // Don't reveal if user exists (security)
    return null;
  }

  // Generate reset token
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  db.createResetToken(token, email, expiresAt);

  // In production: send email with reset link
  console.log(`[AUTH] Password reset requested for ${email}`);
  console.log(`[AUTH] Reset token: ${token}`);

  return token;
}

/**
 * Verify reset token
 */
export function verifyResetToken(token: string): string | null {
  const resetToken = db.getResetToken(token);

  if (!resetToken) {
    return null;
  }

  // Check if expired
  if (new Date(resetToken.expires_at) < new Date()) {
    db.deleteResetToken(token);
    return null;
  }

  return resetToken.email;
}

/**
 * Reset password with token
 */
export function resetPassword(token: string, newPassword: string): boolean {
  const email = verifyResetToken(token);

  if (!email) {
    return false;
  }

  const user = db.getUserByEmail(email);

  if (!user) {
    return false;
  }

  try {
    // Hash password with scrypt
    db.updateUser(user.id, { password_hash: hashPassword(newPassword) });

    // Delete used token
    db.deleteResetToken(token);

    // Invalidate all sessions for this user
    db.deleteUserSessions(user.id);

    console.log(`[AUTH] Password reset successful for ${email}`);
    return true;
  } catch (e) {
    console.error('[AUTH] Password reset failed:', e);
    return false;
  }
}

/**
 * Send password reset email (stub)
 * In production: integrate with email service (SendGrid, AWS SES, etc.)
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetLink = `https://barnaba.ai/kokpit/reset-hasla?token=${token}`;

  console.log(`[EMAIL] Sending password reset to ${email}`);
  console.log(`[EMAIL] Reset link: ${resetLink}`);

  // In production:
  // await emailService.send({
  //   to: email,
  //   subject: 'Resetowanie hasla - Barnaba.ai',
  //   html: `<p>Kliknij link aby zresetowac haslo: <a href="${resetLink}">${resetLink}</a></p>`
  // });

  return true;
}

// Export hash function for password scripts
export { hashPassword };
