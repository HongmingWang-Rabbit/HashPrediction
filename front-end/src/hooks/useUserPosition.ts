"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";

export type UserPosition = {
  yesBet: bigint;
  noBet: bigint;
  claimed: boolean;
};

export function useUserPosition(marketId: number) {
  const { address } = useAccount();

  const position = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getUserPosition",
    args: [BigInt(marketId), address!],
    query: { enabled: !!address && marketId > 0, refetchInterval: 30_000 },
  });

  const payout = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "calculatePayout",
    args: [BigInt(marketId), address!],
    query: { enabled: !!address && marketId > 0, refetchInterval: 30_000 },
  });

  return {
    position: position.data as UserPosition | undefined,
    payout: payout.data as bigint | undefined,
    refetch: () => { position.refetch(); payout.refetch(); },
    isLoading: position.isLoading || payout.isLoading,
  };
}
