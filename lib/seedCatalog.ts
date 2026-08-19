export interface ProviderSeed {
  brandId: number;
  name: string;
  type: string;
  apiUrl?: string;
  apiToken?: string;
  logo?: string;
  gameCount: number;
  ggrMargin: number;
  games: Array<{
    gameUid: string;
    gameId?: number;
    name: string;
    category: "slots" | "live" | "crash" | "table" | "originals";
    rtp: number;
    volatility: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    maxMultiplier: string;
    thumbnail: string;
    banner?: string;
    isFeatured?: boolean;
  }>;
}

export const INITIAL_PROVIDERS_SEED: ProviderSeed[] = [
  {
    brandId: 1,
    name: "Royal Games Studio",
    type: "ROYAL_NATIVE",
    apiUrl: "http://localhost:3002",
    logo: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80",
    gameCount: 6,
    ggrMargin: 10.0,
    games: [
      {
        gameUid: "royal_coinflip",
        gameId: 88801,
        name: "Coin Flip Royale",
        category: "originals",
        rtp: 98.5,
        volatility: "MEDIUM",
        maxMultiplier: "100x",
        thumbnail: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&q=80",
        isFeatured: true,
      },
      {
        gameUid: "royal_andarbahar",
        gameId: 88802,
        name: "Andar Bahar Live",
        category: "live",
        rtp: 98.0,
        volatility: "LOW",
        maxMultiplier: "2.0x",
        thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80",
        isFeatured: true,
      },
      {
        gameUid: "royal_chickencross",
        gameId: 88803,
        name: "Chicken Road Cross",
        category: "crash",
        rtp: 97.8,
        volatility: "HIGH",
        maxMultiplier: "250x",
        thumbnail: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80",
        isFeatured: true,
      },
      {
        gameUid: "royal_aviator",
        gameId: 88804,
        name: "Aviator Royale Crash",
        category: "crash",
        rtp: 97.0,
        volatility: "VERY_HIGH",
        maxMultiplier: "1000x",
        thumbnail: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&q=80",
        isFeatured: true,
      },
      {
        gameUid: "royal_mines",
        gameId: 88805,
        name: "Mines Gold",
        category: "originals",
        rtp: 98.2,
        volatility: "HIGH",
        maxMultiplier: "500x",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
        isFeatured: true,
      },
      {
        gameUid: "royal_roulette",
        gameId: 88806,
        name: "European Roulette",
        category: "table",
        rtp: 97.3,
        volatility: "MEDIUM",
        maxMultiplier: "36x",
        thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
        isFeatured: true,
      },
    ],
  },
];
