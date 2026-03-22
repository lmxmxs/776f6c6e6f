/**
 * Gamification Module - Badge System
 * WWW v2.0 Standard - Reusable across all sites
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    type: 'count' | 'action' | 'time' | 'combination';
    target?: number;
    actions?: string[];
  };
}

export const BADGE_DEFINITIONS: Badge[] = [
  // Beginner Badges
  {
    id: 'first_login',
    name: 'Witaj w Gronie',
    description: 'Pierwsze logowanie do platformy',
    icon: '👋',
    color: 'bg-bronze',
    criteria: { type: 'action', actions: ['login'] }
  },
  {
    id: 'profile_complete',
    name: 'Kompletny Profil',
    description: 'Uzupełnij 100% swojego profilu',
    icon: '✨',
    color: 'bg-bronze',
    criteria: { type: 'action', actions: ['profile_complete'] }
  },
  {
    id: 'first_16q',
    name: 'Samopoznanie',
    description: 'Ukończenie testu osobowości 16Q',
    icon: '🧠',
    color: 'bg-bronze',
    criteria: { type: 'action', actions: ['16q_complete'] }
  },

  // Networking Badges
  {
    id: 'networker_5',
    name: 'Znawca Ludzi',
    description: 'Nawiązanie 5 kontaktów',
    icon: '🤝',
    color: 'bg-silver',
    criteria: { type: 'count', target: 5 }
  },
  {
    id: 'networker_25',
    name: 'Super Networkingowiec',
    description: 'Nawiązanie 25 kontaktów',
    icon: '🌐',
    color: 'bg-gold',
    criteria: { type: 'count', target: 25 }
  },
  {
    id: 'networker_100',
    name: 'Mistrz Networking',
    description: 'Nawiązanie 100 kontaktów',
    icon: '👑',
    color: 'bg-platinum',
    criteria: { type: 'count', target: 100 }
  },

  // Content Badges
  {
    id: 'first_article',
    name: 'Debiut Pisarski',
    description: 'Pierwsza opublikowana treść',
    icon: '📝',
    color: 'bg-bronze',
    criteria: { type: 'action', actions: ['publish_content'] }
  },
  {
    id: 'content_creator_10',
    name: 'Aktywny Twórca',
    description: '10 opublikowanych treści',
    icon: '✍️',
    color: 'bg-silver',
    criteria: { type: 'count', target: 10 }
  },
  {
    id: 'content_creator_50',
    name: 'Ekspert Treści',
    description: '50 opublikowanych treści',
    icon: '📚',
    color: 'bg-gold',
    criteria: { type: 'count', target: 50 }
  },

  // Event Badges
  {
    id: 'first_event',
    name: 'Uczestnik',
    description: 'Wzięcie udziału w pierwszym spotkaniu',
    icon: '🎯',
    color: 'bg-bronze',
    criteria: { type: 'action', actions: ['attend_event'] }
  },
  {
    id: 'event_regular',
    name: 'Stały Bywalec',
    description: 'Uczestnictwo w 10 spotkaniach',
    icon: '🎪',
    color: 'bg-silver',
    criteria: { type: 'count', target: 10 }
  },
  {
    id: 'event_organizer',
    name: 'Organizator',
    description: 'Zorganizowanie własnego wydarzenia',
    icon: '🎬',
    color: 'bg-gold',
    criteria: { type: 'action', actions: ['organize_event'] }
  },

  // Business Badges
  {
    id: 'first_deal',
    name: 'Pierwszy Biznes',
    description: 'Pierwsza współpraca z platformy',
    icon: '💼',
    color: 'bg-silver',
    criteria: { type: 'action', actions: ['complete_deal'] }
  },
  {
    id: 'deal_maker',
    name: 'Deal Maker',
    description: '5 udanych współprac',
    icon: '💰',
    color: 'bg-gold',
    criteria: { type: 'count', target: 5 }
  },
  {
    id: 'business_tycoon',
    name: 'Magnat Biznesu',
    description: '25 udanych współprac',
    icon: '🏆',
    color: 'bg-platinum',
    criteria: { type: 'count', target: 25 }
  },

  // Special Badges
  {
    id: 'early_adopter',
    name: 'Pionier',
    description: 'Dołączenie w pierwszym miesiącu działania platformy',
    icon: '🚀',
    color: 'bg-diamond',
    criteria: { type: 'time' }
  },
  {
    id: 'ambassador',
    name: 'Ambasador',
    description: 'Polecenie platformy 10 osobom',
    icon: '🌟',
    color: 'bg-platinum',
    criteria: { type: 'count', target: 10 }
  },
  {
    id: 'legend',
    name: 'Legenda',
    description: 'Zdobycie wszystkich pozostałych odznak',
    icon: '💎',
    color: 'bg-diamond',
    criteria: { type: 'combination' }
  }
];

/**
 * Check if user earned a badge
 */
export function checkBadgeEarned(
  badge: Badge,
  userStats: {
    logins?: number;
    contacts?: number;
    content?: number;
    events?: number;
    deals?: number;
    referrals?: number;
    actions?: string[];
  }
): boolean {
  const { criteria } = badge;

  switch (criteria.type) {
    case 'count':
      const stat = badge.id.includes('networker') ? userStats.contacts :
                   badge.id.includes('content') ? userStats.content :
                   badge.id.includes('event') ? userStats.events :
                   badge.id.includes('deal') ? userStats.deals :
                   badge.id.includes('ambassador') ? userStats.referrals : 0;
      return stat! >= (criteria.target || 0);

    case 'action':
      return criteria.actions?.some(action =>
        userStats.actions?.includes(action)
      ) || false;

    case 'time':
      // Would check registration date
      return false; // Placeholder

    case 'combination':
      // Would check if all other badges are earned
      return false; // Placeholder

    default:
      return false;
  }
}

/**
 * Get user's earned badges
 */
export function getUserBadges(userStats: any) {
  return BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    earned: checkBadgeEarned(badge, userStats),
    earnedAt: badge.earned ? new Date().toISOString() : undefined
  }));
}
