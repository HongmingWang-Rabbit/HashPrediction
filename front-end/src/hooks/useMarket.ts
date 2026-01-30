"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";
import type { Market } from "./useMarkets";

export function useMarket(id: number) {
  const result = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getMarket",
    args: [BigInt(id)],
    query: {
      enabled: id > 0,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  });

  // Refetch when bets are placed on this market
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "BetPlaced",
    onLogs: (logs) => {
      if (logs.some((l) => Number((l.args as any)?.marketId) === id)) {
        result.refetch();
      }
    },
  });

  // Refetch when market is resolved
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "MarketResolved",
    onLogs: (logs) => {
      if (logs.some((l) => Number((l.args as any)?.marketId) === id)) {
        result.refetch();
      }
    },
  });

  // Refetch when market is cancelled
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "MarketCancelled",
    onLogs: (logs) => {
      if (logs.some((l) => Number((l.args as any)?.marketId) === id)) {
        result.refetch();
      }
    },
  });

  return { ...result, data: result.data as Market | undefined };
}
