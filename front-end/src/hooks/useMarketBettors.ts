"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, DEPLOY_BLOCK } from "@/config/contracts";

// Global cache shared across all hook instances
const bettorCache = new Map<string, number>();
let fetchPromise: Promise<void> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60_000; // 1 minute

export function useMarketBettorCount(marketId: bigint): number {
  const client = usePublicClient();
  const [count, setCount] = useState(() => bettorCache.get(marketId.toString()) ?? 0);

  useEffect(() => {
    if (!client) return;

    const now = Date.now();
    // If cache is fresh, use it
    if (bettorCache.has(marketId.toString()) && now - lastFetchTime < CACHE_TTL) {
      setCount(bettorCache.get(marketId.toString())!);
      return;
    }

    // Fetch all BetPlaced events once and cache
    if (!fetchPromise || now - lastFetchTime >= CACHE_TTL) {
      fetchPromise = client
        .getLogs({
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
        })
        .then((logs) => {
          const marketBettors = new Map<string, Set<string>>();
          for (const log of logs) {
            const mId = log.args.marketId?.toString();
            const bettor = log.args.bettor?.toLowerCase();
            if (!mId || !bettor) continue;
            if (!marketBettors.has(mId)) marketBettors.set(mId, new Set());
            marketBettors.get(mId)!.add(bettor);
          }
          bettorCache.clear();
          for (const [mId, bettors] of marketBettors) {
            bettorCache.set(mId, bettors.size);
          }
          lastFetchTime = Date.now();
        })
        .catch(() => {
          // silently fail
        });
    }

    fetchPromise!.then(() => {
      setCount(bettorCache.get(marketId.toString()) ?? 0);
    });
  }, [client, marketId]);

  return count;
}
