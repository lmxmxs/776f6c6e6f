# 📝 Moduł Blog System

**Wersja:** 1.0.0
**Autor:** Barnabaai
**Standard:** WWW v2.0

## Opis

Kompletny system blogowy z artykułami, kategoriami, tagami i paginacją. Wykorzystuje Astro Content Collections.

## Funkcje

- ✅ Lista postów blogowych z paginacją
- ✅ Pojedynczy post (full view)
- ✅ Kategorie i tagi
- ✅ Drafts support (published: false)
- ✅ Sortowanie po dacie
- ✅ Hero images
- ✅ SEO-friendly URLs

## Instalacja

```bash
# 1. Skopiuj moduł
cp -r /path/to/modules/blog/ ./src/modules/

# 2. Dodaj do module-registry.json
{
  "modules": {
    "blog": {
      "version": "1.0.0",
      "enabled": true
    }
  }
}

# 3. Utwórz Content Collection
# src/content/blog/ z plikami .md lub .mdx
```

## Użycie

### Komponenty

#### BlogPostItem.astro

Wyświetla pojedynczy post na liście.

**Props:**
- `post` (CollectionEntry<'blog'>) - Obiekt posta

**Przykład:**
```astro
---
import BlogPostItem from '@/modules/blog/components/BlogPostItem.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---

<div class="blog-list">
  {posts.map(post => <BlogPostItem post={post} />)}
</div>
```

### Utility Functions

#### `getBlogPosts(options?: BlogOptions): Promise<BlogPost[]>`

Pobiera posty blogowe z opcjami filtrowania.

```typescript
import { getBlogPosts } from '@/modules/blog/lib/blog';

// Wszystkie opublikowane posty
const posts = await getBlogPosts();

// Z opcjami
const posts = await getBlogPosts({
  limit: 10,
  includeDrafts: false,
  category: 'tech'
});
```

## Konfiguracja Content Collection

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date(),
    heroImage: z.string().optional(),
    author: z.string().optional(),
    published: z.boolean().default(true),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { blog };
```

## Przykład Posta

```mdx
---
title: "Mój pierwszy post"
description: "Opis posta dla SEO"
pubDate: 2026-01-03
heroImage: "/images/hero.jpg"
author: "Barnabaai"
published: true
categories: ["tech", "ai"]
tags: ["astro", "blog"]
---

# Treść posta

To jest mój pierwszy post na blogu!
```

## Licencja

MIT

## Autor

**Barnabaai**
