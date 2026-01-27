"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";

export type Market = {
  id: bigint;
  question: string;
  resolutionTime: bigint;
  state: number;
  winningOutcome: number;
  yesPool: bigint;
  noPool: bigint;
  creationFee: bigint;
  creator: `0x${string}`;
  createdAt: bigint;
  configSnapshot: { feeRecipient: `0x${string}`; maxFeePercentage: bigint };
};

export function useMarketCount() {
  return useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getMarketCount",
    query: { refetchInterval: 15000 },
  });
}

export function useMarkets() {
  const { data: count } = useMarketCount();
  const marketCount = Number(count ?? 0);

  const contracts = Array.from({ length: marketCount }, (_, i) => ({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getMarket" as const,
    args: [BigInt(i + 1)] as const,
  }));

  const result = useReadContracts({
    contracts,
    query: {
      enabled: marketCount > 0,
      refetchInterval: 15000,
    },
  });

  const markets: Market[] = (result.data ?? [])
    .map((r) => r.result as Market | undefined)
    .filter((m): m is Market => !!m);

  return { ...result, data: markets, marketCount };
}
