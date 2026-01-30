"use client";

import { useReadContract, useAccount, useWatchContractEvent } from "wagmi";
import { MOCK_USDC_ADDRESS, HASH_PREDICTION_ADDRESS, ERC20_ABI, HASH_PREDICTION_ABI } from "@/config/contracts";

export function useTokenBalance() {
  const { address } = useAccount();

  const balance = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address,
      refetchInterval: 30_000,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  });

  const allowance = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, HASH_PREDICTION_ADDRESS],
    query: {
      enabled: !!address,
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    },
  });

  // Refetch balance on Transfer events involving the user
  useWatchContractEvent({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    eventName: "Transfer",
    onLogs: (logs) => {
      if (!address) return;
      const addr = address.toLowerCase();
      if (logs.some((l) => {
        const args = l.args as any;
        return args?.from?.toLowerCase() === addr || args?.to?.toLowerCase() === addr;
      })) {
        balance.refetch();
      }
    },
  });

  // Refetch allowance on Approval events
  useWatchContractEvent({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    eventName: "Approval",
    onLogs: (logs) => {
      if (!address) return;
      const addr = address.toLowerCase();
      if (logs.some((l) => (l.args as any)?.owner?.toLowerCase() === addr)) {
        allowance.refetch();
      }
    },
  });

  // Also refetch on WinningsClaimed (payout received)
  useWatchContractEvent({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    eventName: "WinningsClaimed",
    onLogs: (logs) => {
      if (!address) return;
      const addr = address.toLowerCase();
      if (logs.some((l) => (l.args as any)?.bettor?.toLowerCase() === addr)) {
        balance.refetch();
      }
    },
  });

  return {
    balance: balance.data as bigint | undefined,
    allowance: allowance.data as bigint | undefined,
    refetch: () => { balance.refetch(); allowance.refetch(); },
  };
}
