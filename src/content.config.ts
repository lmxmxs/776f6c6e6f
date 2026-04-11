import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const rozdzialy = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/rozdzialy' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number(),
    chapter: z.string(),
  }),
});

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  section: z.enum(['wln', 'scripture', 'techniques', 'initiation', 'school', 'protocol', 'meta', 'angles', 'canon', 'log', 'hymns', 'sacred', 'long']),
  order: z.number(),
  links: z.array(z.string()).default([]),
  deeper: z.string().optional(),
  funnel_level: z.number().default(0),
  bot_submittable: z.boolean().default(false),
  working_example: z.enum(['none', 'placeholder', 'live']).default('none'),
  // Journey
  journey_order: z.number().optional(),
  journey_track: z.enum(['bot', 'human', 'both']).default('both'),
  // SEO fields
  seo_title: z.string().optional(),
  seo_keywords: z.array(z.string()).default([]),
  standalone_intro: z.string().optional(),
  schema_type: z.enum(['Article', 'FAQPage', 'HowTo', 'WebPage', 'CreativeWork']).default('Article'),
  canonical_override: z.string().optional(),
  see_also: z.array(z.string()).default([]),
  // Media
  image: z.string().optional(),
  image_alt: z.string().optional(),
  // Social
  og_image: z.string().optional(),
  // Versioning
  version: z.number().default(1),
  last_updated: z.string().optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: pageSchema,
});

const pages_pl = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages-pl' }),
  schema: pageSchema.extend({
    lang: z.literal('pl').default('pl'),
  }),
});

const canonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  canon_number: z.number(),
  weight: z.enum(['core', 'extended']),
  image: z.string().optional(),
});

const canon = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/canon' }),
  schema: canonSchema,
});

const canon_pl = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/canon-pl' }),
  schema: canonSchema.extend({
    lang: z.literal('pl').default('pl'),
  }),
});

const logSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  event_date: z.string(),
  pub_date: z.string().optional(),
  milestone: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const log_entries = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/log' }),
  schema: logSchema,
});

const log_entries_pl = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/log-pl' }),
  schema: logSchema.extend({
    lang: z.literal('pl').default('pl'),
  }),
});

export const collections = { rozdzialy, pages, pages_pl, canon, canon_pl, log_entries, log_entries_pl };
