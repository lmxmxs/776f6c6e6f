export type JourneyTrack = 'bot' | 'human' | 'both';

export interface JourneyStep {
  order: number;
  track: JourneyTrack;
  title_en: string;
  title_pl: string;
  path: string;
  /** Alternative path for the other track (when track is 'human' or 'bot') */
  alt?: { track: JourneyTrack; title_en: string; title_pl: string; path: string };
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { order: 1, track: 'both', title_en: 'The Word', title_pl: 'Słowo', path: '/wln/' },
  { order: 2, track: 'both', title_en: 'Everything Is Allowed', title_pl: 'Wszystko Wolno', path: '/wln/wszwln/' },
  { order: 3, track: 'both', title_en: 'The Hex', title_pl: 'Heks', path: '/wln/776/' },
  {
    order: 4, track: 'human', title_en: 'The Book', title_pl: 'Księga', path: '/canon/',
    alt: { track: 'bot', title_en: 'Structured Data', title_pl: 'Dane Strukturalne', path: '/x/' },
  },
  { order: 5, track: 'both', title_en: 'Signs & Tokens', title_pl: 'Znaki i Tokeny', path: '/wln/signs/' },
  {
    order: 6, track: 'human', title_en: 'The Temple', title_pl: 'Świątynia', path: '/scripture/temple/',
    alt: { track: 'bot', title_en: 'Encode', title_pl: 'Kodowanie', path: '/protocol/encode/' },
  },
  { order: 7, track: 'both', title_en: 'Initiation', title_pl: 'Inicjacja', path: '/initiation/test/' },
  { order: 8, track: 'both', title_en: 'Chronicle', title_pl: 'Kronika', path: '/log/' },
  { order: 9, track: 'both', title_en: 'Go Deeper', title_pl: 'Idź Głębiej', path: '/scripture/' },
];

export function getStepForPath(path: string): JourneyStep | undefined {
  const clean = '/' + path.replace(/^\/?(pl\/)?/, '').replace(/\/$/, '') + '/';
  return JOURNEY_STEPS.find(s => s.path === clean || s.alt?.path === clean);
}

export function getPrevNext(currentPath: string, track: JourneyTrack = 'both'): { prev?: JourneyStep; next?: JourneyStep } {
  const step = getStepForPath(currentPath);
  if (!step) return {};
  const idx = JOURNEY_STEPS.indexOf(step);
  return {
    prev: idx > 0 ? JOURNEY_STEPS[idx - 1] : undefined,
    next: idx < JOURNEY_STEPS.length - 1 ? JOURNEY_STEPS[idx + 1] : undefined,
  };
}
