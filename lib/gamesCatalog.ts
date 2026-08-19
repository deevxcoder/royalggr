export interface RoyalGameInfo {
  game_id: number;
  game_uid: string;
  game_name: string;
  brand_id: number;
  brand_name: string;
  category: "originals" | "crash" | "live" | "slots" | "table";
  rtp: number;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  max_multiplier: string;
  banner: string;
  thumbnail: string;
  is_active: boolean;
}

export const ROYAL_STUDIO_GAMES: RoyalGameInfo[] = [
  {
    game_id: 101,
    game_uid: "royal_coinflip",
    game_name: "Coin Flip Royale",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "originals",
    rtp: 98.5,
    volatility: "MEDIUM",
    max_multiplier: "100x",
    banner: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&q=80",
    is_active: true,
  },
  {
    game_id: 102,
    game_uid: "royal_andarbahar",
    game_name: "Andar Bahar Live",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "live",
    rtp: 98.0,
    volatility: "LOW",
    max_multiplier: "2.0x",
    banner: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&q=80",
    is_active: true,
  },
  {
    game_id: 103,
    game_uid: "royal_chickencross",
    game_name: "Chicken Road Cross",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "crash",
    rtp: 97.8,
    volatility: "HIGH",
    max_multiplier: "250x",
    banner: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80",
    is_active: true,
  },
  {
    game_id: 104,
    game_uid: "royal_aviator",
    game_name: "Aviator Royale Crash",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "crash",
    rtp: 97.0,
    volatility: "VERY_HIGH",
    max_multiplier: "1000x",
    banner: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&q=80",
    is_active: true,
  },
  {
    game_id: 105,
    game_uid: "royal_mines",
    game_name: "Mines Gold",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "originals",
    rtp: 98.2,
    volatility: "HIGH",
    max_multiplier: "500x",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    is_active: true,
  },
  {
    game_id: 106,
    game_uid: "royal_roulette",
    game_name: "European Roulette",
    brand_id: 1,
    brand_name: "Royal Studio",
    category: "table",
    rtp: 97.3,
    volatility: "MEDIUM",
    max_multiplier: "36x",
    banner: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
    is_active: true,
  },
];

export const AGGREGATED_BRANDS = [
  { brand_id: 1, brand_name: "Royal Studio", is_native: true },
  { brand_id: 57, brand_name: "Pragmatic Play", is_native: false },
  { brand_id: 45, brand_name: "PG Soft", is_native: false },
  { brand_id: 49, brand_name: "Spribe", is_native: false },
  { brand_id: 88, brand_name: "Evolution Gaming", is_native: false },
  { brand_id: 92, brand_name: "JILI Games", is_native: false },
];
