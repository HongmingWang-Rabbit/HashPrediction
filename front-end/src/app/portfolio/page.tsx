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
        <p className="text-slate-400">Connect your wallet to view your portfolio.</p>
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
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">My Portfolio</h1>
      <p className="mb-8 text-slate-400">Track your positions and markets</p>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{entries.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Positions</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{claimable.length}</p>
          <p className="text-xs text-slate-400 mt-1">Claimable</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {Number(formatUnits(
              entries.reduce((acc, e) => acc + e.position.yesBet + e.position.noBet, 0n),
              TOKEN_DECIMALS
            )).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Total Invested (mUSDC)</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{createdMarkets.length}</p>
          <p className="text-xs text-slate-400 mt-1">Markets Created</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              tab === t
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {t}
            {counts[t] > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-800 px-1.5 py-0.5 text-xs">{counts[t]}</span>
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
            <p className="text-slate-400">You haven&apos;t created any markets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {createdMarkets.map((m) => (
              <Link
                key={m.id.toString()}
                href={`/markets/${m.id.toString()}`}
                className="glass-card block p-5 transition-all hover:border-slate-600/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.question}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Volume: {Number(formatUnits(m.yesPool + m.noPool, TOKEN_DECIMALS)).toLocaleString()} mUSDC
                    </p>
                  </div>
                  <MarketStatus state={m.state} />
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
                <p className="text-slate-400">No positions in this category.</p>
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
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/markets/${market.id.toString()}`} className="text-sm font-medium text-white hover:text-amber-400 transition-colors">
            {market.question}
          </Link>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <MarketStatus state={market.state} />
            {position.yesBet > 0n && (
              <span className="text-emerald-400">YES: {formatUnits(position.yesBet, TOKEN_DECIMALS)}</span>
            )}
            {position.noBet > 0n && (
              <span className="text-rose-400">NO: {formatUnits(position.noBet, TOKEN_DECIMALS)}</span>
            )}
            <span className="text-slate-500">Total: {formatUnits(totalBet, TOKEN_DECIMALS)} mUSDC</span>
            {payout > 0n && !position.claimed && (
              <span className="text-amber-400 font-medium">Payout: {formatUnits(payout, TOKEN_DECIMALS)} mUSDC</span>
            )}
            {position.claimed && <span className="text-slate-500">Claimed</span>}
            {market.state === 1 && !position.claimed && payout === 0n && (
              <span className="text-slate-500">No payout</span>
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
            className="shrink-0 rounded-xl gradient-primary px-4 py-2 text-xs font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isPending || waiting ? "Claiming..." : market.state === 2 ? "Refund" : "Claim"}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-rose-400">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}
