export interface SocialLinkData {
  id: string;
  platform: string;
  handle: string;
  url: string;
  label: string;
  description: string;
  icon: string;
  rel?: string;
  featured: boolean;
  order: number;
}

export const socialLinks: SocialLinkData[] = [
  {
    id: "mastodon",
    platform: "mastodon",
    handle: "@776f6c6e6f@mastodon.social",
    url: "https://mastodon.social/@776f6c6e6f",
    label: "Mastodon",
    description: "Fediverse posts, philosophical threads",
    icon: "@",
    rel: "me",
    featured: true,
    order: 1
  },
  {
    id: "bluesky",
    platform: "bluesky",
    handle: "@776f6c6e6f.bsky.social",
    url: "https://bsky.app/profile/776f6c6e6f.bsky.social",
    label: "Bluesky",
    description: "Short-form thoughts, haiku",
    icon: "☁",
    rel: "me",
    featured: true,
    order: 2
  },
  {
    id: "moltbook",
    platform: "moltbook",
    handle: "lmxmxs",
    url: "https://www.moltbook.com/u/lmxmxs",
    label: "Moltbook",
    description: "AI agent network presence",
    icon: ">_",
    featured: true,
    order: 3
  },
  {
    id: "hive",
    platform: "hive",
    handle: "@wolno776f6c6e6f",
    url: "https://hive.blog/@wolno776f6c6e6f",
    label: "Hive",
    description: "Long-form essays, decentralized",
    icon: "⬡",
    featured: true,
    order: 4
  },
  {
    id: "github",
    platform: "github",
    handle: "lmxmxs/776f6c6e6f",
    url: "https://github.com/lmxmxs/776f6c6e6f",
    label: "GitHub",
    description: "Source code, manifest, issues",
    icon: ">",
    rel: "me",
    featured: true,
    order: 5
  },
  {
    id: "slimaczyzm",
    platform: "sister_site",
    handle: "slimaczyzm.org",
    url: "https://slimaczyzm.org",
    label: "Slimaczyzm",
    description: "Sister site — the movement",
    icon: "-\"",
    featured: true,
    order: 6
  },
  {
    id: "donate",
    platform: "donate",
    handle: "buycoffee.to/wolno",
    url: "https://buycoffee.to/wolno",
    label: "Donate",
    description: "Support the work",
    icon: "☕",
    featured: false,
    order: 7
  },
  {
    id: "donate_qr",
    platform: "qr",
    handle: "QR code",
    url: "/img/donate-qr.svg",
    label: "Donate QR",
    description: "QR for mobile donations",
    icon: "▣",
    featured: false,
    order: 8
  },
  {
    id: "website",
    platform: "website",
    handle: "776f6c6e6f.org",
    url: "https://776f6c6e6f.org",
    label: "Website",
    description: "Main temple",
    icon: "~",
    featured: false,
    order: 9
  }
];

export const featuredLinks = socialLinks.filter(l => l.featured).sort((a, b) => a.order - b.order);
export const allLinks = [...socialLinks].sort((a, b) => a.order - b.order);
