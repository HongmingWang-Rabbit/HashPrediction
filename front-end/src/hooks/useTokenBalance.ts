"use client";

import { useReadContract, useAccount } from "wagmi";
import { MOCK_USDC_ADDRESS, HASH_PREDICTION_ADDRESS, ERC20_ABI } from "@/config/contracts";

export function useTokenBalance() {
  const { address } = useAccount();

  const balance = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  const allowance = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, HASH_PREDICTION_ADDRESS],
    query: { enabled: !!address, refetchInterval: 30_000 },
  });

  return {
    balance: balance.data as bigint | undefined,
    allowance: allowance.data as bigint | undefined,
    refetch: () => { balance.refetch(); allowance.refetch(); },
  };
}
