"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatUnits } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, TOKEN_DECIMALS } from "@/config/contracts";
import { useUserPortfolio, type PortfolioEntry } from "@/hooks/useUserPortfolio";
import { MarketStatus } from "@/components/MarketStatus";
import { SkeletonCard } from "@/components/Skeleton";

const TABS = ["Active", "Claimable", "History", "My Markets"] as const;
type Tab = (typeof TABS)[number];

export default function PortfolioPage() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("Active");
  const { entries, createdMarkets, isLoading, refetch } = useUserPortfolio();

  if (!isConnected) {
    return (
      <div className="glass-card mx-auto max-w-lg p-12 text-center">
        <p className="text-[#70707b]">Connect your wallet to view your portfolio.</p>
      </div>
    );
  }

  const active = entries.filter((e) => e.market.state === 0);
  const claimable = entries.filter(
    (e) => e.market.state !== 0 && !e.position.claimed && e.payout > 0n
  );
  const history = entries.filter(
    (e) => e.market.state !== 0 && (e.position.claimed || e.payout === 0n)
  );

  const counts: Record<Tab, number> = {
    Active: active.length,
    Claimable: claimable.length,
    History: history.length,
    "My Markets": createdMarkets.length,
  };

  function getEntries(): PortfolioEntry[] {
    if (tab === "Active") return active;
    if (tab === "Claimable") return claimable;
    if (tab === "History") return history;
    return [];
  }

  return (
    <div className="min-w-0 overflow-hidden">
      <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-white">My Portfolio</h1>
      <p className="mb-8 text-[#70707b]">Track your positions and markets</p>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <div className="glass-card p-3 sm:p-4 text-center overflow-hidden">
          <p className="text-xl sm:text-2xl font-bold text-[#9f6ffd]">{entries.length}</p>
          <p className="text-xs text-[#70707b] mt-1">Total Positions</p>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center overflow-hidden">
          <p className="text-xl sm:text-2xl font-bold text-[#19bf86]">{claimable.length}</p>
          <p className="text-xs text-[#70707b] mt-1">Claimable</p>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center overflow-hidden">
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {Number(formatUnits(
              entries.reduce((acc, e) => acc + e.position.yesBet + e.position.noBet, 0n),
              TOKEN_DECIMALS
            )).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-xs text-[#70707b] mt-1">Total Invested (mUSDC)</p>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center overflow-hidden">
          <p className="text-xl sm:text-2xl font-bold text-[#9f6ffd]">{createdMarkets.length}</p>
          <p className="text-xs text-[#70707b] mt-1">Markets Created</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all ${
              tab === t
                ? "bg-[#9f6ffd]/10 text-[#9f6ffd] border border-[#9f6ffd]/20"
                : "text-[#70707b] hover:text-white hover:bg-[#17181e]/50"
            }`}
          >
            {t}
            {counts[t] > 0 && (
              <span className="ml-1.5 rounded-full bg-[#17181e] px-1.5 py-0.5 text-xs">{counts[t]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tab === "My Markets" ? (
        createdMarkets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-[#70707b]">You haven&apos;t created any markets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {createdMarkets.map((m) => (
              <Link
                key={m.id.toString()}
                href={`/markets/${m.id.toString()}`}
                className="glass-card block p-5 transition-all hover:border-[#3f3f46]/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.question}</p>
                    <p className="text-xs text-[#f4f4f5]0 mt-1">
                      Volume: {Number(formatUnits(m.yesPool + m.noPool, TOKEN_DECIMALS)).toLocaleString()} mUSDC
                    </p>
                  </div>
                  <MarketStatus state={m.state} resolutionTime={m.resolutionTime} />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        (() => {
          const items = getEntries();
          if (items.length === 0) {
            return (
              <div className="glass-card p-12 text-center">
                <p className="text-[#70707b]">No positions in this category.</p>
              </div>
            );
          }
          return (
            <div className="space-y-3">
              {items.map((e) => (
                <PositionRow key={e.market.id.toString()} entry={e} onClaimed={refetch} />
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
}

function PositionRow({ entry, onClaimed }: { entry: PortfolioEntry; onClaimed: () => void }) {
  const { market, position, payout } = entry;
  const totalBet = position.yesBet + position.noBet;
  const canClaim = market.state !== 0 && !position.claimed && payout > 0n;

  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({
    hash: tx,
    query: { enabled: !!tx },
  });

  useEffect(() => {
    if (isSuccess) onClaimed();
  }, [isSuccess, onClaimed]);

  return (
    <div className="glass-card p-4 sm:p-5 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/markets/${market.id.toString()}`} className="text-sm font-medium text-white hover:text-[#9f6ffd] transition-colors line-clamp-2">
            {market.question}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2 sm:gap-3 text-xs">
            <MarketStatus state={market.state} resolutionTime={market.resolutionTime} />
            {position.yesBet > 0n && (
              <span className="text-[#19bf86]">YES: {formatUnits(position.yesBet, TOKEN_DECIMALS)}</span>
            )}
            {position.noBet > 0n && (
              <span className="text-[#f8495e]">NO: {formatUnits(position.noBet, TOKEN_DECIMALS)}</span>
            )}
            <span className="text-[#f4f4f5]0">Total: {formatUnits(totalBet, TOKEN_DECIMALS)} mUSDC</span>
            {payout > 0n && !position.claimed && (
              <span className="text-[#9f6ffd] font-medium">Payout: {formatUnits(payout, TOKEN_DECIMALS)} mUSDC</span>
            )}
            {position.claimed && <span className="text-[#f4f4f5]0">Claimed</span>}
            {market.state === 1 && !position.claimed && payout === 0n && (
              <span className="text-[#f4f4f5]0">No payout</span>
            )}
          </div>
        </div>
        {canClaim && (
          <button
            onClick={() =>
              writeContract({
                address: HASH_PREDICTION_ADDRESS,
                abi: HASH_PREDICTION_ABI,
                functionName: "claimWinnings",
                args: [market.id],
              })
            }
            disabled={isPending || waiting}
            className="shrink-0 rounded-xl gradient-primary px-4 py-2 text-xs font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending || waiting ? "Claiming..." : market.state === 2 ? "Refund" : "Claim"}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-[#f8495e]">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}
