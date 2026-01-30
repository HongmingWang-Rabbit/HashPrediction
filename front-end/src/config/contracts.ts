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
export const HASH_PREDICTION_ADDRESS = "0xcC502F4b4Ebd5DF402Df83C7CbCE1c7E6FCA7787" as `0x${string}`;
export const HASH_PREDICTION_IMPL_ADDRESS = "0xDbC69FcE5966B4f224d9D761F997662b51A1C7fF" as `0x${string}`;
export const MOCK_USDC_ADDRESS = "0x896504918289f0B3B346574Fe47190074Cfd31Cc" as `0x${string}`;
export const ADMIN_ADDRESS = "0xafb5963275f4E0F75AC472F7ABDfAeD06903d85C" as `0x${string}`;

// Block number when the contract was deployed — use as fromBlock instead of "earliest"
export const DEPLOY_BLOCK = 23308055n;

export const HASH_PREDICTION_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "CATEGORY_CRYPTO",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "CATEGORY_ENTERTAINMENT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "CATEGORY_OTHER",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "CATEGORY_POLITICS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "CATEGORY_SPORTS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_CREATOR_REWARD",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "MAX_FEE_LIMIT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculatePayout",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "payout",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cancelMarket",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimMultipleWinnings",
    "inputs": [
      {
        "name": "_marketIds",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimWinnings",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "config",
    "inputs": [],
    "outputs": [
      {
        "name": "admin",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "feeRecipient",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "maxFeePercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "creatorRewardPercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "paused",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [
      {
        "name": "_question",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_resolutionTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_feeAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_category",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct HashPrediction.Config",
        "components": [
          {
            "name": "admin",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "feeRecipient",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "maxFeePercentage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creatorRewardPercentage",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "paused",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct HashPrediction.Market",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "question",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "resolutionTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "state",
            "type": "uint8",
            "internalType": "enum HashPrediction.MarketState"
          },
          {
            "name": "winningOutcome",
            "type": "uint8",
            "internalType": "enum HashPrediction.Outcome"
          },
          {
            "name": "yesPool",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "noPool",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creationFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "configSnapshot",
            "type": "tuple",
            "internalType": "struct HashPrediction.ConfigSnapshot",
            "components": [
              {
                "name": "feeRecipient",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "maxFeePercentage",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "category",
            "type": "bytes32",
            "internalType": "bytes32"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarketCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserPosition",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct HashPrediction.UserPosition",
        "components": [
          {
            "name": "yesBet",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "noBet",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "claimed",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserStats",
    "inputs": [
      {
        "name": "_user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct HashPrediction.UserStats",
        "components": [
          {
            "name": "totalBets",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalWins",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalLosses",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalVolume",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "currentStreak",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "bestStreak",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastBetDay",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "dailyStreak",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      {
        "name": "_stablecoin",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_stablecoinDecimals",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "_admin",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_feeRecipient",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_maxFeePercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_creatorRewardPercentage",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "marketCounter",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "markets",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "question",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "resolutionTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "state",
        "type": "uint8",
        "internalType": "enum HashPrediction.MarketState"
      },
      {
        "name": "winningOutcome",
        "type": "uint8",
        "internalType": "enum HashPrediction.Outcome"
      },
      {
        "name": "yesPool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "noPool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "creationFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "createdAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "configSnapshot",
        "type": "tuple",
        "internalType": "struct HashPrediction.ConfigSnapshot",
        "components": [
          {
            "name": "feeRecipient",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "maxFeePercentage",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "category",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "placeBet",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_outcome",
        "type": "uint8",
        "internalType": "enum HashPrediction.Outcome"
      },
      {
        "name": "_amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proxiableUUID",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolveMarket",
    "inputs": [
      {
        "name": "_marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_winningOutcome",
        "type": "uint8",
        "internalType": "enum HashPrediction.Outcome"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stablecoin",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "stablecoinDecimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateConfig",
    "inputs": [
      {
        "name": "_feeRecipient",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_maxFeePercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_creatorRewardPercentage",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgradeTo",
    "inputs": [
      {
        "name": "newImplementation",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "upgradeToAndCall",
    "inputs": [
      {
        "name": "newImplementation",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "userPositions",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "yesBet",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "noBet",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "claimed",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "userStats",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "totalBets",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalWins",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalLosses",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "totalVolume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "currentStreak",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "bestStreak",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastBetDay",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "dailyStreak",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "AdminChanged",
    "inputs": [
      {
        "name": "previousAdmin",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "newAdmin",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BeaconUpgraded",
    "inputs": [
      {
        "name": "beacon",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum HashPrediction.Outcome"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ConfigUpdated",
    "inputs": [
      {
        "name": "admin",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "feeRecipient",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "maxFeePercentage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ContractPaused",
    "inputs": [
      {
        "name": "admin",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ContractUnpaused",
    "inputs": [
      {
        "name": "admin",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CreatorRewardPaid",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Initialized",
    "inputs": [
      {
        "name": "version",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCancelled",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "yesPool",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "noPool",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "question",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "resolutionTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "fee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winningOutcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum HashPrediction.Outcome"
      },
      {
        "name": "yesPool",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "noPool",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "StreakUpdated",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "streak",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Upgraded",
    "inputs": [
      {
        "name": "implementation",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "WinningsClaimed",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AlreadyClaimed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyPaused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "EmptyQuestion",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientAllowance",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientBalance",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidFee",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidMarket",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidOutcome",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidResolutionTime",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MarketAlreadyFinalized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MarketExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MarketNotActive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "MarketNotFinalized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoOpposition",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoPosition",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotAdmin",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPaused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Paused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuard",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ZeroAmount",
    "inputs": []
  }
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
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export const TOKEN_DECIMALS = 6;
export const ONE_TOKEN = BigInt(10 ** TOKEN_DECIMALS);
