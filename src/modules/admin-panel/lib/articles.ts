// @PATH: /src/lib/admin/articles.ts
// @PROJECT: 112358 (Fraktale Galeria)
// Admin article management utilities

import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';
import type { BlogEntry } from '../../utils/categories';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

export interface ArticleData {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  published?: boolean;
}

/**
 * Get all articles with full data
 */
export async function getAllArticles(): Promise<BlogEntry[]> {
  const articles = await getCollection('blog');
  return articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(slug: string): Promise<BlogEntry | undefined> {
  const articles = await getCollection('blog');
  return articles.find(article => article.slug === slug);
}

/**
 * Create new article
 */
export async function createArticle(slug: string, data: ArticleData, content: string = ''): Promise<void> {
  const filename = `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  // Check if file already exists
  try {
    await fs.access(filepath);
    throw new Error(`Article with slug "${slug}" already exists`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }

  // Create frontmatter
  const frontmatter = generateFrontmatter(data);

  // Create file content
  const fileContent = `---
${frontmatter}
---

${content}
`;

  await fs.writeFile(filepath, fileContent, 'utf-8');
}

/**
 * Update existing article
 */
export async function updateArticle(slug: string, data: Partial<ArticleData>, content?: string): Promise<void> {
  const filename = `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  // Read existing file
  const fileContent = await fs.readFile(filepath, 'utf-8');

  // Parse frontmatter and content
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error('Invalid article format');
  }

  const existingContent = content !== undefined ? content : frontmatterMatch[2];

  // Merge data with existing
  const article = await getArticleBySlug(slug);
  if (!article) throw new Error('Article not found');

  const mergedData: ArticleData = {
    ...article.data,
    ...data,
    updatedDate: new Date()
  };

  // Generate new frontmatter
  const frontmatter = generateFrontmatter(mergedData);

  // Write updated content
  const newContent = `---
${frontmatter}
---

${existingContent}
`;

  await fs.writeFile(filepath, newContent, 'utf-8');
}

/**
 * Delete article
 */
export async function deleteArticle(slug: string): Promise<void> {
  const filename = `${slug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);
  await fs.unlink(filepath);
}

/**
 * Generate YAML frontmatter from data
 */
function generateFrontmatter(data: ArticleData): string {
  const lines: string[] = [];

  lines.push(`title: "${data.title.replace(/"/g, '\\"')}"`);

  if (data.description) {
    lines.push(`description: "${data.description.replace(/"/g, '\\"')}"`);
  }

  lines.push(`pubDate: ${data.pubDate.toISOString()}`);

  if (data.updatedDate) {
    lines.push(`updatedDate: ${data.updatedDate.toISOString()}`);
  }

  if (data.heroImage) {
    lines.push(`heroImage: "${data.heroImage}"`);
  }

  if (data.author) {
    lines.push(`author: "${data.author}"`);
  }

  if (data.tags && data.tags.length > 0) {
    lines.push(`tags:`);
    data.tags.forEach(tag => {
      lines.push(`  - "${tag}"`);
    });
  }

  if (data.categories && data.categories.length > 0) {
    lines.push(`categories:`);
    data.categories.forEach(cat => {
      lines.push(`  - "${cat}"`);
    });
  }

  if (data.published !== undefined) {
    lines.push(`published: ${data.published}`);
  }

  return lines.join('\n');
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
