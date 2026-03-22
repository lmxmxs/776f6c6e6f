/**
 * TypeScript types dla modułu Blog
 */

import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogOptions {
  limit?: number;
  includeDrafts?: boolean;
  category?: string;
  tag?: string;
}

export interface BlogCategory {
  name: string;
  count: number;
}

export interface BlogTag {
  name: string;
  count: number;
}
