"use client";

import { useReadContract } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";
import type { Market } from "./useMarkets";

export function useMarket(id: number) {
  const result = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getMarket",
    args: [BigInt(id)],
    query: { enabled: id > 0, refetchInterval: 15000 },
  });

  return { ...result, data: result.data as Market | undefined };
}
