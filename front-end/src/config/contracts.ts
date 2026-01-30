// Source-controlled config — no .env needed
import { defineChain } from "viem";

export const hashkeyTestnet = defineChain({
  id: 133,
  name: "HashKey Chain Testnet",
  nativeCurrency: { name: "HSK", symbol: "HSK", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.hsk.xyz"] },
  },
  blockExplorers: {
    default: { name: "HashKey Explorer", url: "https://testnet-explorer.hsk.xyz" },
  },
  testnet: true,
});

// ─── Deployed Contract Addresses ───────────────────────────────────
// Source-controlled config — no .env needed.
// When contract dev deploys new contracts, update these addresses here.
export const HASH_PREDICTION_ADDRESS = "0xC89bE9D4124E75869174ABd46b47De5a0d7e57E9" as `0x${string}`;
export const MOCK_USDC_ADDRESS = "0x9cefc16AD9dD2a4be819c616017F51d3A016C6ab" as `0x${string}`;
export const ADMIN_ADDRESS = "0xafb5963275f4E0F75AC472F7ABDfAeD06903d85C" as `0x${string}`;

export const HASH_PREDICTION_ABI = [
  {
    type: "function",
    name: "marketCounter",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "_marketId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "resolutionTime", type: "uint256" },
          { name: "state", type: "uint8" },
          { name: "winningOutcome", type: "uint8" },
          { name: "yesPool", type: "uint256" },
          { name: "noPool", type: "uint256" },
          { name: "creationFee", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          {
            name: "configSnapshot",
            type: "tuple",
            components: [
              { name: "feeRecipient", type: "address" },
              { name: "maxFeePercentage", type: "uint256" },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPosition",
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "yesBet", type: "uint256" },
          { name: "noBet", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculatePayout",
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [{ name: "payout", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "admin", type: "address" },
          { name: "feeRecipient", type: "address" },
          { name: "maxFeePercentage", type: "uint256" },
          { name: "paused", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "_question", type: "string" },
      { name: "_resolutionTime", type: "uint256" },
      { name: "_feeAmount", type: "uint256" },
    ],
    outputs: [{ name: "marketId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "placeBet",
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcome", type: "uint8" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimWinnings",
    inputs: [{ name: "_marketId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveMarket",
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_winningOutcome", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelMarket",
    inputs: [{ name: "_marketId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateConfig",
    inputs: [
      { name: "_feeRecipient", type: "address" },
      { name: "_maxFeePercentage", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "MarketCreated",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "question", type: "string", indexed: false },
      { name: "resolutionTime", type: "uint256", indexed: false },
      { name: "creator", type: "address", indexed: true },
      { name: "fee", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "bettor", type: "address", indexed: true },
      { name: "outcome", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WinningsClaimed",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "bettor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketResolved",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
      { name: "winningOutcome", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "MarketCancelled",
    inputs: [
      { name: "marketId", type: "uint256", indexed: true },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;

export const TOKEN_DECIMALS = 6;
