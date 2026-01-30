"use client";

import { useEffect, useRef } from "react";
import { formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Id } from "react-toastify";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, TOKEN_DECIMALS } from "@/config/contracts";
import { useUserPosition } from "@/hooks/useUserPosition";
import { txToast } from "@/lib/toast";

interface Props {
  marketId: number;
  marketState: number;
  yesPool?: bigint;
  noPool?: bigint;
}

export function PositionDisplay({ marketId, marketState, yesPool, noPool }: Props) {
  const { position, payout, refetch } = useUserPosition(marketId);
  const { writeContract, data: tx, isPending, error: claimError } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({
    hash: tx,
    query: { enabled: !!tx },
  });
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
    if (isSuccess) {
      if (toastId.current !== null) {
        txToast.success(toastId.current, marketState === 2 ? "Refund claimed! 💰" : "Winnings claimed! 💰");
        toastId.current = null;
      }
      refetch();
    }
  }, [isSuccess, refetch, marketState]);

  useEffect(() => {
    if (claimError && toastId.current !== null) {
      txToast.error(toastId.current, claimError.message?.includes("User rejected") ? "Transaction rejected" : claimError.message?.split("\n")[0] ?? "Claim failed");
      toastId.current = null;
    }
  }, [claimError]);

  if (!position || (position.yesBet === 0n && position.noBet === 0n)) return null;

  const totalPool = (yesPool ?? 0n) + (noPool ?? 0n);
  const totalBet = position.yesBet + position.noBet;

  // Estimated value: what you'd get if market resolved in your favor right now
  let estimatedValue: bigint | null = null;
  if (marketState === 0 && totalPool > 0n) {
    if (position.yesBet > 0n && yesPool && yesPool > 0n) {
      estimatedValue = (position.yesBet * totalPool) / yesPool;
    } else if (position.noBet > 0n && noPool && noPool > 0n) {
      estimatedValue = (position.noBet * totalPool) / noPool;
    }
  }

  const canClaim = marketState !== 0 && !position.claimed && payout !== undefined && payout > 0n;
  const isCancelled = marketState === 2;
  const isResolved = marketState === 1;
  const userWon = isResolved && payout !== undefined && payout > 0n;
  const userLost = isResolved && !position.claimed && (payout === undefined || payout === 0n);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Your Position</h3>
        <span className="text-xs text-[#f4f4f5]0">Total: {formatUnits(totalBet, TOKEN_DECIMALS)} mUSDC</span>
      </div>

      <div className="space-y-3">
        {position.yesBet > 0n && (
          <div className="flex items-center justify-between rounded-xl bg-[#19bf86]/5 border border-[#19bf86]/10 px-4 py-3">
            <span className="text-sm text-[#d1d1d6]">YES Position</span>
            <span className="text-sm font-semibold text-[#19bf86]">{formatUnits(position.yesBet, TOKEN_DECIMALS)} mUSDC</span>
          </div>
        )}
        {position.noBet > 0n && (
          <div className="flex items-center justify-between rounded-xl bg-[#f8495e]/5 border border-[#f8495e]/10 px-4 py-3">
            <span className="text-sm text-[#d1d1d6]">NO Position</span>
            <span className="text-sm font-semibold text-[#f8495e]">{formatUnits(position.noBet, TOKEN_DECIMALS)} mUSDC</span>
          </div>
        )}

        {/* Estimated value for active markets */}
        {estimatedValue !== null && marketState === 0 && (
          <div className="flex items-center justify-between rounded-xl bg-[#9f6ffd]/5 border border-[#9f6ffd]/10 px-4 py-3">
            <div>
              <span className="text-sm text-[#d1d1d6]">Est. Value</span>
              <p className="text-xs text-[#f4f4f5]0 mt-0.5">If resolved in your favor now</p>
            </div>
            <span className="text-sm font-semibold text-[#9f6ffd]">{formatUnits(estimatedValue, TOKEN_DECIMALS)} mUSDC</span>
          </div>
        )}

        {/* Payout for resolved/cancelled */}
        {isCancelled && !position.claimed && (
          <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 px-4 py-3 text-center">
            <p className="text-sm font-medium text-blue-400">Full Refund Available</p>
            <p className="text-xs text-[#f4f4f5]0 mt-1">Market was cancelled. Claim your refund below.</p>
          </div>
        )}

        {userWon && !position.claimed && (
          <div className="rounded-xl bg-[#19bf86]/5 border border-[#19bf86]/10 px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#19bf86]">{formatUnits(payout ?? 0n, TOKEN_DECIMALS)} mUSDC</p>
            <p className="text-xs text-[#f4f4f5]0 mt-0.5">Winnings available</p>
          </div>
        )}

        {userLost && (
          <div className="rounded-xl bg-[#17181e]/50 px-4 py-3 text-center">
            <p className="text-sm text-[#f4f4f5]0">No payout — your side did not win</p>
          </div>
        )}

        {position.claimed && (
          <div className="rounded-xl bg-[#17181e]/50 px-4 py-3 text-center">
            <p className="text-sm text-[#f4f4f5]0">Already claimed</p>
          </div>
        )}

        {/* Info tooltip for active markets */}
        {marketState === 0 && (
          <p className="text-xs text-[#f4f4f5]0 text-center">
            Positions can be claimed once the market is resolved
          </p>
        )}
      </div>

      {canClaim && (
        <button
          onClick={() => {
            toastId.current = txToast.pending(isCancelled ? "Claiming refund..." : "Claiming winnings...");
            writeContract({
              address: HASH_PREDICTION_ADDRESS,
              abi: HASH_PREDICTION_ABI,
              functionName: "claimWinnings",
              args: [BigInt(marketId)],
            });
          }}
          disabled={isPending || waiting}
          className="mt-4 w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isPending || waiting ? "Claiming..." : isCancelled ? "Claim Refund" : "Claim Winnings"}
        </button>
      )}

    </div>
  );
}
