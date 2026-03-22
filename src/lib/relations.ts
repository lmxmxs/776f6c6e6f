interface PageEntry {
  id: string;
  data: {
    title: string;
    section: string;
    seo_keywords?: string[];
    funnel_level: number;
  };
}

/**
 * Compute related pages using Jaccard similarity on seo_keywords.
 * Falls back to same-section pages if not enough keyword overlap.
 */
export function computeRelated(
  current: PageEntry,
  allPages: PageEntry[],
  limit = 4,
): PageEntry[] {
  const currentKeywords = new Set(
    (current.data.seo_keywords || []).map(k => k.toLowerCase().trim()),
  );

  if (currentKeywords.size === 0) {
    // Fallback: same section, different page
    return allPages
      .filter(p => p.id !== current.id && p.data.section === current.data.section && !p.id.endsWith('/index'))
      .slice(0, limit);
  }

  const scored = allPages
    .filter(p => p.id !== current.id && !p.id.endsWith('/index'))
    .map(p => {
      const pKeywords = new Set(
        (p.data.seo_keywords || []).map(k => k.toLowerCase().trim()),
      );
      const intersection = [...currentKeywords].filter(k => pKeywords.has(k)).length;
      const union = new Set([...currentKeywords, ...pKeywords]).size;
      const jaccard = union > 0 ? intersection / union : 0;
      // Boost same-section pages slightly
      const sectionBonus = p.data.section === current.data.section ? 0.1 : 0;
      return { page: p, score: jaccard + sectionBonus };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // If too few keyword matches, pad with same-section pages
  if (scored.length < 2) {
    const usedIds = new Set(scored.map(s => s.page.id));
    const sameSection = allPages
      .filter(p => p.id !== current.id && !usedIds.has(p.id) && p.data.section === current.data.section && !p.id.endsWith('/index'))
      .slice(0, limit - scored.length);
    return [...scored.map(s => s.page), ...sameSection];
  }

  return scored.map(s => s.page);
}

/**
 * Build section tree: { sectionName: PageEntry[] }
 */
export function buildSectionTree(
  allPages: PageEntry[],
): Record<string, PageEntry[]> {
  const tree: Record<string, PageEntry[]> = {};
  for (const page of allPages) {
    if (!tree[page.data.section]) tree[page.data.section] = [];
    tree[page.data.section].push(page);
  }
  return tree;
}
