import { keccak256, toHex } from "viem";

export type Category = {
  key: string;
  label: string;
  emoji: string;
  hash: `0x${string}`;
  color: string;
};

const CATEGORY_KEYS = ["CRYPTO", "SPORTS", "POLITICS", "ENTERTAINMENT", "OTHER"] as const;

export const CATEGORIES: Category[] = CATEGORY_KEYS.map((key) => {
  const hash = keccak256(toHex(key));
  const map: Record<string, { label: string; emoji: string; color: string }> = {
    CRYPTO: { label: "Crypto", emoji: "🪙", color: "#f7931a" },
    SPORTS: { label: "Sports", emoji: "⚽", color: "#19bf86" },
    POLITICS: { label: "Politics", emoji: "🏛️", color: "#6366f1" },
    ENTERTAINMENT: { label: "Entertainment", emoji: "🎬", color: "#ec4899" },
    OTHER: { label: "Other", emoji: "🔬", color: "#a1a1aa" },
  };
  const m = map[key]!;
  return { key, hash, ...m };
});

export function getCategoryByHash(hash: string): Category | undefined {
  return CATEGORIES.find((c) => c.hash.toLowerCase() === hash.toLowerCase());
}

export function getCategoryLabel(hash: string): string {
  const cat = getCategoryByHash(hash);
  return cat ? `${cat.emoji} ${cat.label}` : "🔬 Other";
}
