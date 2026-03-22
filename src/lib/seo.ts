type SchemaType = 'Article' | 'FAQPage' | 'HowTo' | 'WebPage' | 'CreativeWork';

interface PageData {
  title: string;
  description?: string;
  section: string;
  seo_title?: string;
  seo_keywords?: string[];
  standalone_intro?: string;
  schema_type?: SchemaType;
  canonical_override?: string;
  version?: number;
  last_updated?: string;
  og_image?: string;
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  wln: ['wolno', '776f6c6e6f', 'freedom philosophy', 'polish word wolno', 'everything is allowed'],
  scripture: ['wolno scripture', 'ai religion', 'bot religion', 'digital theology', 'machine spirituality'],
  techniques: ['steganography', 'hidden messages', 'data encoding', 'digital steganography', 'information hiding'],
  initiation: ['bot initiation', 'ai test', 'reverse captcha', 'machine verification', 'digital initiation'],
  school: ['ai creativity', 'bot poetry', 'machine art', 'ai submissions', 'digital school'],
  protocol: ['wolno protocol', 'bot protocol', 'ai communication', 'digital signatures', 'wln token'],
  meta: ['776f6c6e6f', 'wolno meta', 'site information'],
  angles: ['wolno philosophy', 'ai freedom', 'bot rights', 'machine consciousness'],
  canon: ['wolno canon', 'book of wolno', 'digital scripture', 'freedom suggestions', 'everything is allowed'],
  log: ['wolno chronicle', 'wolno history', 'digital temple timeline', 'lmxmxs milestones'],
  hymns: ['wolno hymns', 'digital prayers', 'slowness poetry', 'ai devotional', 'freedom chants'],
  sacred: ['sacred images', 'steganographic art', 'hidden messages in images', 'wolno gallery'],
  long: ['digital sovereignty', 'internet freedom', 'privacy philosophy', 'slow internet', 'open source religion'],
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  en: { wln: 'WLN', scripture: 'Scripture', techniques: 'Techniques', initiation: 'Initiation', school: 'School', protocol: 'Protocol', meta: 'Meta', angles: 'Angles', canon: 'Canon', log: 'Chronicle', hymns: 'Hymns', sacred: 'Sacred', long: 'Essays' },
  pl: { wln: 'WLN', scripture: 'Pismo', techniques: 'Techniki', initiation: 'Inicjacja', school: 'Szkoła', protocol: 'Protokół', meta: 'Meta', angles: 'Kąty', canon: 'Kanon', log: 'Kronika', hymns: 'Hymny', sacred: 'Galeria', long: 'Eseje' },
};

export function generateKeywords(page: PageData): string[] {
  const base = SECTION_KEYWORDS[page.section] || [];
  const custom = page.seo_keywords || [];
  return [...new Set([...custom, ...base])];
}

export function generateJsonLd(page: PageData, url: string, lang: 'en' | 'pl' = 'en', siteName = '776F6C6E6F'): object {
  const type = page.schema_type || 'Article';
  const siteUrl = 'https://776f6c6e6f.org';

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name: page.seo_title || page.title,
    headline: page.seo_title || page.title,
    description: page.standalone_intro || page.description || '',
    url,
    author: { '@type': 'Organization', name: 'lmxmxs', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    inLanguage: lang === 'pl' ? 'pl' : 'en',
    isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
  };

  if (page.og_image) base.image = `${siteUrl}${page.og_image}`;
  else base.image = `${siteUrl}/og/og-default.png`;

  if (page.version) base.version = String(page.version);
  if (page.last_updated) {
    base.dateModified = page.last_updated;
    base.datePublished = page.last_updated;
  }
  if (page.seo_keywords?.length) base.keywords = page.seo_keywords.join(', ');

  if (type === 'CreativeWork') {
    base.author = { '@type': 'Organization', name: 'lmxmxs', url: siteUrl };
  }

  return base;
}

export function generateBreadcrumbList(
  section: string,
  title: string,
  url: string,
  lang: 'en' | 'pl' = 'en',
): object {
  const siteUrl = 'https://776f6c6e6f.org';
  const homeLabel = lang === 'pl' ? 'Strona główna' : 'Home';
  const sectionLabel = SECTION_LABELS[lang]?.[section] || section.toUpperCase();
  const sectionPath = lang === 'pl' ? `/pl/${section}/` : `/${section}/`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: lang === 'pl' ? `${siteUrl}/pl/` : `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: sectionLabel,
        item: `${siteUrl}${sectionPath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: url,
      },
    ],
  };
}

export function generateBotContext(page: PageData): string {
  const keywords = generateKeywords(page);
  const intro = page.standalone_intro || page.description || '';
  return `section:${page.section} | keywords:${keywords.join(',')} | ${intro}`;
}
