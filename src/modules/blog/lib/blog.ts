/**
 * Blog utility functions
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface BlogOptions {
  limit?: number;
  includeDrafts?: boolean;
  category?: string;
  tag?: string;
}

export async function getBlogPosts(options: BlogOptions = {}) {
  const { limit, includeDrafts = false, category, tag } = options;

  let posts = await getCollection('blog');

  // Filtruj drafty
  if (!includeDrafts) {
    posts = posts.filter(post => post.data.published !== false);
  }

  // Filtruj po kategorii
  if (category) {
    posts = posts.filter(post =>
      post.data.categories?.includes(category)
    );
  }

  // Filtruj po tagu
  if (tag) {
    posts = posts.filter(post =>
      post.data.tags?.includes(tag)
    );
  }

  // Sortuj po dacie (najnowsze pierwsze)
  posts.sort((a, b) =>
    new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  // Limit
  if (limit) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getCollection('blog');
  return posts.find(post => post.slug === slug);
}

export async function getBlogCategories() {
  const posts = await getBlogPosts();
  const categories = new Set<string>();

  posts.forEach(post => {
    post.data.categories?.forEach(cat => categories.add(cat));
  });

  return Array.from(categories).sort();
}

export async function getBlogTags() {
  const posts = await getBlogPosts();
  const tags = new Set<string>();

  posts.forEach(post => {
    post.data.tags?.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}

export async function getRelatedPosts(
  currentPost: CollectionEntry<'blog'>,
  limit = 3
) {
  const allPosts = await getBlogPosts();

  // Exclude current post
  const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug);

  // Score based on shared tags and categories
  const scored = otherPosts.map(post => {
    let score = 0;

    currentPost.data.tags?.forEach(tag => {
      if (post.data.tags?.includes(tag)) score += 2;
    });

    currentPost.data.categories?.forEach(cat => {
      if (post.data.categories?.includes(cat)) score += 3;
    });

    return { post, score };
  });

  // Sort by score and take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
