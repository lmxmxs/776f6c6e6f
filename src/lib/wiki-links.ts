import type { Root, Text, Link } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

export const wikiLinksPlugin: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      const value = node.value;
      if (!value.includes('[[')) return;

      const children: (Text | Link)[] = [];
      let lastIndex = 0;

      for (const match of value.matchAll(WIKI_LINK_RE)) {
        const fullMatch = match[0];
        const inner = match[1];
        const matchIndex = match.index!;

        if (matchIndex > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, matchIndex) });
        }

        // [[display|path]] or [[title]]
        const parts = inner.split('|');
        const display = parts[0].trim();
        const linkPath = (parts[1] || parts[0]).trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-\/]/g, '');

        children.push({
          type: 'link',
          url: `/${linkPath}/`,
          children: [{ type: 'text', value: display }],
          data: {
            hProperties: { class: 'wiki-link', 'data-wiki': 'true' },
          },
        } as Link);

        lastIndex = matchIndex + fullMatch.length;
      }

      if (children.length === 0) return;

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
};
