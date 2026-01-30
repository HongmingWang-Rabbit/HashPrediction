"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, hashkeyTestnet, TOKEN_DECIMALS, DEPLOY_BLOCK } from "@/config/contracts";

export interface LeaderboardEntry {
  address: string;
  totalBets: number;
  totalVolume: bigint;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  // We derive these from on-chain BetPlaced events since getUserStats may not exist yet
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const client = usePublicClient({ chainId: hashkeyTestnet.id });

  useEffect(() => {
    if (!client) return;

    async function fetch() {
      try {
        // Scan BetPlaced events to collect unique addresses and stats
        const betLogs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
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
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        const claimLogs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
            type: "event",
            name: "WinningsClaimed",
            inputs: [
              { name: "marketId", type: "uint256", indexed: true },
              { name: "bettor", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
              { name: "timestamp", type: "uint256", indexed: false },
            ],
          },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        // Build per-address stats
        const stats = new Map<string, { bets: number; volume: bigint; wins: number; markets: Set<string> }>();

        for (const log of betLogs) {
          const addr = (log.args as any).bettor as string;
          const amount = (log.args as any).amount as bigint;
          const marketId = ((log.args as any).marketId as bigint).toString();
          if (!addr) continue;
          const key = addr.toLowerCase();
          const existing = stats.get(key) ?? { bets: 0, volume: 0n, wins: 0, markets: new Set<string>() };
          existing.bets++;
          existing.volume += amount;
          existing.markets.add(marketId);
          stats.set(key, existing);
        }

        // Track wins from claim events
        const claimers = new Set<string>();
        for (const log of claimLogs) {
          const addr = (log.args as any).bettor as string;
          if (!addr) continue;
          const key = addr.toLowerCase();
          const existing = stats.get(key);
          if (existing) {
            existing.wins++;
          }
          claimers.add(key);
        }

        const result: LeaderboardEntry[] = [];
        for (const [addr, s] of stats) {
          const losses = Math.max(0, s.markets.size - s.wins);
          result.push({
            address: addr,
            totalBets: s.bets,
            totalVolume: s.volume,
            totalWins: s.wins,
            totalLosses: losses,
            winRate: s.markets.size > 0 ? (s.wins / s.markets.size) * 100 : 0,
          });
        }

        setEntries(result);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [client]);

  return { entries, loading };
}
