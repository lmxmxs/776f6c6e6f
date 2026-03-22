/**
 * Moduł: Admin Panel
 * Wersja: 1.0.0
 * Autor: Barnabaai
 *
 * Kompletny panel administracyjny z autentykacją i zarządzaniem treścią
 */

// Export komponentów
export { default as ArticleEditor } from './components/ArticleEditor.astro';
export { default as ImageEditor } from './components/ImageEditor.astro';

// Export utils - auth
export {
  login,
  logout,
  checkAuth,
  generateSessionId,
  hashPassword
} from './lib/auth';

// Export utils - articles
export {
  getAllArticles,
  getArticleById,
  getPublishedArticles,
  getArticlesByCategory
} from './lib/articles';

// Export types
export type {
  LoginResult,
  SessionData,
  AdminUser
} from './types';
