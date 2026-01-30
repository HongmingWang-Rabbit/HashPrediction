"use client";

import { useAccount, useReadContracts } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";
import { useMarkets, type Market } from "./useMarkets";
import type { UserPosition } from "./useUserPosition";

export type PortfolioEntry = {
  market: Market;
  position: UserPosition;
  payout: bigint;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function useUserPortfolio() {
  const { address } = useAccount();
  const { data: markets, isLoading: marketsLoading } = useMarkets();

  const safeAddress = address ?? ZERO_ADDRESS;

  // Batch fetch positions for all markets
  const positionContracts = markets.map((m) => ({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getUserPosition" as const,
    args: [m.id, safeAddress] as const,
  }));

  const payoutContracts = markets.map((m) => ({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "calculatePayout" as const,
    args: [m.id, safeAddress] as const,
  }));

  const positions = useReadContracts({
    contracts: positionContracts,
    query: {
      enabled: !!address && markets.length > 0,
      refetchInterval: 30_000,
    },
  });

  const payouts = useReadContracts({
    contracts: payoutContracts,
    query: {
      enabled: !!address && markets.length > 0,
      refetchInterval: 30_000,
    },
  });

  const entries: PortfolioEntry[] = [];
  for (let i = 0; i < markets.length; i++) {
    const pos = positions.data?.[i]?.result as UserPosition | undefined;
    const payout = (payouts.data?.[i]?.result as bigint) ?? 0n;
    if (pos && (pos.yesBet > 0n || pos.noBet > 0n)) {
      entries.push({ market: markets[i], position: pos, payout });
    }
  }

  const createdMarkets = address
    ? markets.filter((m) => m.creator.toLowerCase() === address.toLowerCase())
    : [];

  return {
    entries,
    createdMarkets,
    isLoading: marketsLoading || positions.isLoading || payouts.isLoading,
    refetch: () => { positions.refetch(); payouts.refetch(); },
  };
}
