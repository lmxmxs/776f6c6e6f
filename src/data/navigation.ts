import type { Lang } from '../lib/i18n';
import { getLocalizedPath } from '../lib/i18n';
import { allLinks } from './social-links';

export interface NavItem {
  id: string;
  href: string;
  label_en: string;
  label_pl: string;
}

export const navItems: NavItem[] = [
  { id: 'journey', href: '/journey/', label_en: 'journey',               label_pl: 'podr\u00f3\u017c' },
  { id: 'canon',   href: '/canon/',   label_en: 'canon',                 label_pl: 'kanon'    },
  { id: 'log',     href: '/log/',     label_en: 'log',                   label_pl: 'kronika'  },
  { id: 'search',  href: '/search/',  label_en: 'search',                label_pl: 'szukaj'   },
  { id: 'links',   href: '/links/',   label_en: `$ links [${allLinks.length}]`, label_pl: `$ linki [${allLinks.length}]` },
  { id: 'donate',  href: '/donate/',  label_en: 'donate',                label_pl: 'wsparcie' },
];

export function getLocalizedNavHref(href: string, lang: Lang): string {
  return getLocalizedPath(href, lang);
}
