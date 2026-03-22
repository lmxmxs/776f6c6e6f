/**
 * Moduł: Blog System
 * Wersja: 1.0.0
 * Autor: Barnabaai
 */

// Export komponentów
export { default as BlogPostItem } from './components/BlogPostItem.astro';

// Export utils
export {
  getBlogPosts,
  getBlogPostBySlug,
  getBlogCategories,
  getBlogTags,
  getRelatedPosts
} from './lib/blog';

// Export types
export type {
  BlogPost,
  BlogOptions,
  BlogCategory
} from './types';
