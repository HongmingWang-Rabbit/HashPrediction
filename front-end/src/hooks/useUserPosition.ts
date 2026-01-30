"use client";

import { useReadContract, useWatchContractEvent } from "wagmi";
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
    query: {
      enabled: !!address && marketId > 0,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  });

  const payout = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "calculatePayout",
    args: [BigInt(marketId), address!],
    query: {
      enabled: !!address && marketId > 0,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  });

  // Refetch on BetPlaced for this market
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "BetPlaced",
    onLogs: (logs) => {
      if (logs.some((l) => Number(((l.args as { marketId?: bigint })?.marketId)) === marketId)) {
        position.refetch();
        payout.refetch();
      }
    },
  });

  // Refetch on MarketResolved
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "MarketResolved",
    onLogs: (logs) => {
      if (logs.some((l) => Number(((l.args as { marketId?: bigint })?.marketId)) === marketId)) {
        position.refetch();
        payout.refetch();
      }
    },
  });

  // Refetch on WinningsClaimed for this market
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "WinningsClaimed",
    onLogs: (logs) => {
      if (logs.some((l) => Number(((l.args as { marketId?: bigint })?.marketId)) === marketId)) {
        position.refetch();
        payout.refetch();
      }
    },
  });

  return {
    position: position.data as UserPosition | undefined,
    payout: payout.data as bigint | undefined,
    refetch: () => { position.refetch(); payout.refetch(); },
    isLoading: position.isLoading || payout.isLoading,
  };
}
