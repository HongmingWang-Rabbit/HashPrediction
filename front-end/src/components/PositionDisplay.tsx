"use client";

import { useEffect } from "react";
import { formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, TOKEN_DECIMALS } from "@/config/contracts";
import { useUserPosition } from "@/hooks/useUserPosition";

export function PositionDisplay({ marketId, marketState }: { marketId: number; marketState: number }) {
  const { position, payout, refetch } = useUserPosition(marketId);
  const { writeContract, data: tx, isPending, error: claimError } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({
    hash: tx,
    query: { enabled: !!tx },
  });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  if (!position || (position.yesBet === 0n && position.noBet === 0n)) return null;

  const canClaim = marketState !== 0 && !position.claimed && payout !== undefined && payout > 0n;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="mb-3 text-sm font-medium text-gray-400">Your Position</h3>
      <div className="space-y-1 text-sm">
        {position.yesBet > 0n && (
          <p>YES: <span className="text-green-400">{formatUnits(position.yesBet, TOKEN_DECIMALS)} mUSDC</span></p>
        )}
        {position.noBet > 0n && (
          <p>NO: <span className="text-red-400">{formatUnits(position.noBet, TOKEN_DECIMALS)} mUSDC</span></p>
        )}
        {payout !== undefined && payout > 0n && (
          <p>Payout: <span className="text-yellow-400">{formatUnits(payout, TOKEN_DECIMALS)} mUSDC</span></p>
        )}
        {position.claimed && <p className="text-gray-500">Already claimed</p>}
      </div>
      {canClaim && (
        <button
          onClick={() =>
            writeContract({
              address: HASH_PREDICTION_ADDRESS,
              abi: HASH_PREDICTION_ABI,
              functionName: "claimWinnings",
              args: [BigInt(marketId)],
            })
          }
          disabled={isPending || waiting}
          className="mt-3 w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
        >
          {isPending || waiting ? "Claiming..." : "Claim Winnings"}
        </button>
      )}
      {claimError && (
        <p className="mt-2 text-xs text-red-400">{claimError.message?.split("\n")[0]}</p>
      )}
    </div>
  );
}
