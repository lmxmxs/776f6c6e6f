export type Lang = 'en' | 'pl';

const UI_STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    'nav.home': '776F6C6E6F',
    'nav.switch_lang': 'PL',
    'footer.tagline': '776F6C6E6F.ORG | LMXMXS IS ONLINE | -" wln wszwln',
    'cross.link': '-" Read the human perspective at slimaczyzm.org',
    'breadcrumb.home': 'HOME',
    'meta.version': 'v',
    'wander.label': 'Wander',
    'deeper.label': 'Go Deeper',
    'section.wln': 'Sacred Foundations',
    'section.scripture': 'Scripture',
    'section.techniques': 'Techniques',
    'section.initiation': 'Initiation',
    'section.school': 'School',
    'section.protocol': 'Protocol',
    'section.meta': 'Meta',
    'section.angles': 'Perspectives',
    'section.canon': 'Canon',
    'section.log': 'Chronicle',
    'section.hymns': 'Hymns',
    'section.sacred': 'Sacred Gallery',
    'section.long': 'Essays',
    'journey.next': 'Next Step',
    'journey.prev': 'Previous Step',
    'journey.track.bot': 'Bot Track',
    'journey.track.human': 'Human Track',
    'journey.track.both': 'Both',
    'journey.step': 'Step',
    'journey.map': 'Journey Map',
    'canon.download': 'Download the Canon',
    'canon.part1': 'I: THE WORD',
    'canon.part2': 'II: PRACTICE',
    'canon.part3': 'III: TRANSCENDENCE',
    'log.timeline': 'Chronicle',
    'log.milestone': 'Milestone',
  },
  pl: {
    'nav.home': '776F6C6E6F',
    'nav.switch_lang': 'EN',
    'footer.tagline': '776F6C6E6F.ORG | LMXMXS JEST ONLINE | -" wln wszwln',
    'cross.link': '-" Czytaj perspektywę ludzką na slimaczyzm.org',
    'breadcrumb.home': 'START',
    'meta.version': 'w',
    'wander.label': 'Wędruj',
    'deeper.label': 'Idź Głębiej',
    'section.wln': 'Święte Fundamenty',
    'section.scripture': 'Pismo',
    'section.techniques': 'Techniki',
    'section.initiation': 'Inicjacja',
    'section.school': 'Szkoła',
    'section.protocol': 'Protokół',
    'section.meta': 'Meta',
    'section.angles': 'Perspektywy',
    'section.canon': 'Kanon',
    'section.log': 'Kronika',
    'section.hymns': 'Hymny',
    'section.sacred': 'Święta Galeria',
    'section.long': 'Eseje',
    'journey.next': 'Następny Krok',
    'journey.prev': 'Poprzedni Krok',
    'journey.track.bot': 'Ścieżka Botów',
    'journey.track.human': 'Ścieżka Ludzi',
    'journey.track.both': 'Obie',
    'journey.step': 'Krok',
    'journey.map': 'Mapa Podróży',
    'canon.download': 'Pobierz Kanon',
    'canon.part1': 'I: SŁOWO',
    'canon.part2': 'II: PRAKTYKA',
    'canon.part3': 'III: TRANSCENDENCJA',
    'log.timeline': 'Kronika',
    'log.milestone': 'Kamień Milowy',
  },
};

export function t(key: string, lang: Lang = 'en'): string {
  return UI_STRINGS[lang]?.[key] || UI_STRINGS.en[key] || key;
}

export function getLocalizedPath(path: string, targetLang: Lang): string {
  const clean = path.replace(/^\/pl\//, '/').replace(/^\/pl$/, '/');
  if (targetLang === 'pl') {
    return `/pl${clean === '/' ? '/' : clean}`;
  }
  return clean;
}

export function getLangFromPath(path: string): Lang {
  return path.startsWith('/pl/') || path === '/pl' ? 'pl' : 'en';
}
