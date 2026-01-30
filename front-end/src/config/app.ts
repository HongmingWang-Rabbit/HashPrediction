// Source-controlled config — no .env needed
// App-level settings for HashPrediction frontend

export const APP_NAME = "HashPrediction";
export const APP_DESCRIPTION = "Binary prediction markets on HashKey Chain";

// Chain
export const CHAIN_ID = 133;
export const RPC_URL = "https://testnet.hsk.xyz";
export const EXPLORER_URL = "https://testnet-explorer.hsk.xyz";

// Market categories
export const MARKET_CATEGORIES = [
  "Crypto",
  "Sports",
  "Politics",
  "Entertainment",
  "Science",
  "Other",
] as const;
export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

// Social links
export const SOCIAL_LINKS = {
  twitter: "",
  discord: "",
  github: "",
} as const;
