"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { HASH_PREDICTION_ADDRESS, hashkeyTestnet, DEPLOY_BLOCK } from "@/config/contracts";

export interface LeaderboardEntry {
  address: string;
  totalBets: number;
  totalVolume: bigint;
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

const CACHE_TTL = 120_000; // 2 minutes
let cachedEntries: LeaderboardEntry[] | null = null;
let cachedAt = 0;

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(cachedEntries ?? []);
  const [loading, setLoading] = useState(!cachedEntries);
  const client = usePublicClient({ chainId: hashkeyTestnet.id });

  useEffect(() => {
    if (!client) return;
    if (cachedEntries && Date.now() - cachedAt < CACHE_TTL) {
      setEntries(cachedEntries);
      setLoading(false);
      return;
    }

    async function fetch() {
      try {
        // TODO: This O(n) scan of all events should move to an indexer/subgraph at scale.
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
          const addr = ((log.args as { bettor?: string; amount?: bigint; marketId?: bigint })).bettor as string;
          const amount = ((log.args as { bettor?: string; amount?: bigint; marketId?: bigint })).amount as bigint;
          const marketId = (((log.args as { bettor?: string; amount?: bigint; marketId?: bigint })).marketId as bigint).toString();
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
          const addr = ((log.args as { bettor?: string; amount?: bigint; marketId?: bigint })).bettor as string;
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

        cachedEntries = result;
        cachedAt = Date.now();
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
