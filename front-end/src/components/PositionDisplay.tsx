"use client";

import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import { Id } from "react-toastify";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, TOKEN_DECIMALS, hashkeyTestnet, DEPLOY_BLOCK } from "@/config/contracts";
import { EXPLORER_URL } from "@/config/app";
import { useUserPosition } from "@/hooks/useUserPosition";
import { txToast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";

interface Props {
  marketId: number;
  marketState: number;
  yesPool?: bigint;
  noPool?: bigint;
}

export function PositionDisplay({ marketId, marketState, yesPool, noPool }: Props) {
  const { position, payout, refetch, isLoading: positionLoading } = useUserPosition(marketId);
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
      txToast.error(toastId.current, getErrorMessage(claimError));
      toastId.current = null;
    }
  }, [claimError]);

  if (positionLoading) {
    return (
      <div className="glass-card p-6 space-y-3">
        <div className="h-5 w-28 rounded bg-[#3f3f46]/50 animate-pulse" />
        <div className="h-12 w-full rounded-xl bg-[#3f3f46]/30 animate-pulse" />
        <div className="h-12 w-full rounded-xl bg-[#3f3f46]/30 animate-pulse" />
      </div>
    );
  }

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
        <span className="text-xs text-[#70707b]">Total: {formatUnits(totalBet, TOKEN_DECIMALS)} mUSDC</span>
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
              <p className="text-xs text-[#70707b] mt-0.5">If resolved in your favor now</p>
            </div>
            <span className="text-sm font-semibold text-[#9f6ffd]">{formatUnits(estimatedValue, TOKEN_DECIMALS)} mUSDC</span>
          </div>
        )}

        {/* Payout for resolved/cancelled */}
        {isCancelled && !position.claimed && (
          <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 px-4 py-3 text-center">
            <p className="text-sm font-medium text-blue-400">Full Refund Available</p>
            <p className="text-xs text-[#70707b] mt-1">Market was cancelled. Claim your refund below.</p>
          </div>
        )}

        {userWon && !position.claimed && (
          <div className="rounded-xl bg-[#19bf86]/5 border border-[#19bf86]/10 px-4 py-3 text-center">
            <p className="text-lg font-bold text-[#19bf86]">{formatUnits(payout ?? 0n, TOKEN_DECIMALS)} mUSDC</p>
            <p className="text-xs text-[#70707b] mt-0.5">Winnings available</p>
          </div>
        )}

        {userLost && (
          <div className="rounded-xl bg-[#17181e]/50 px-4 py-3 text-center">
            <p className="text-sm text-[#70707b]">No payout — your side did not win</p>
          </div>
        )}

        {position.claimed && (
          <div className="rounded-xl bg-[#17181e]/50 px-4 py-3 text-center">
            <p className="text-sm text-[#70707b]">Already claimed</p>
          </div>
        )}

        {/* Info tooltip for active markets */}
        {marketState === 0 && (
          <p className="text-xs text-[#70707b] text-center">
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
          className="mt-4 w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isPending || waiting ? "Claiming..." : isCancelled ? "Claim Refund" : "Claim Winnings"}
        </button>
      )}

      {/* User's buy history */}
      <UserTxHistory marketId={marketId} />
    </div>
  );
}

interface UserTx {
  outcome: number;
  amount: bigint;
  timestamp: number;
  txHash: string;
}

function UserTxHistory({ marketId }: { marketId: number }) {
  const { address } = useAccount();
  const client = usePublicClient({ chainId: hashkeyTestnet.id });
  const [txs, setTxs] = useState<UserTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !address) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const logs = await client.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
            type: "event",
            name: "BetPlaced",
            inputs: [
              { name: "marketId", type: "uint256", indexed: true },
              { name: "bettor", type: "address", indexed: true },
              { name: "outcome", type: "uint8", indexed: false },
              { name: "amount", type: "uint256", indexed: false },
              { name: "timestamp", type: "uint256", indexed: false },
            ],
          },
          args: { marketId: BigInt(marketId), bettor: address },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        if (cancelled) return;
        const parsed: UserTx[] = logs
          .map((l) => ({
            outcome: Number(l.args.outcome),
            amount: l.args.amount as bigint,
            timestamp: Number(l.args.timestamp ?? 0),
            txHash: l.transactionHash ?? "",
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setTxs(parsed);
      } catch (err) {
        console.error("Failed to fetch user tx history:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [client, address, marketId]);

  if (!address || (!loading && txs.length === 0)) return null;

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <h4 className="text-xs font-semibold text-[#70707b] uppercase tracking-wider mb-3">Your Transactions</h4>
      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-[#3f3f46]/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {txs.map((tx, i) => (
            <a
              key={`${tx.txHash}-${i}`}
              href={`${EXPLORER_URL}/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${tx.outcome === 1 ? "bg-[#19bf86]/10 text-[#19bf86]" : "bg-[#f8495e]/10 text-[#f8495e]"}`}>
                  {tx.outcome === 1 ? "YES" : "NO"}
                </span>
                <span className="text-sm text-white">{formatUnits(tx.amount, TOKEN_DECIMALS)} mUSDC</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#70707b]">
                  {new Date(tx.timestamp * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <svg className="h-3 w-3 text-[#70707b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
