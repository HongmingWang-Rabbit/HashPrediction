"use client";

import { useParams } from "next/navigation";
import { formatUnits } from "viem";
import { useMarket } from "@/hooks/useMarket";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "@/components/MarketStatus";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PoolBar } from "@/components/PoolBar";
import { BetForm } from "@/components/BetForm";
import { PositionDisplay } from "@/components/PositionDisplay";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { data: market, isLoading, refetch } = useMarket(marketId);
  const { balance } = useTokenBalance();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="skeleton h-8 w-64 rounded-lg mb-4" />
        <div className="skeleton h-6 w-full rounded-lg mb-6" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }
  if (!market) return <p className="text-slate-500">Market not found.</p>;

  const isActive = market.state === 0;
  const now = Math.floor(Date.now() / 1000);
  const bettingOpen = isActive && now < Number(market.resolutionTime);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <MarketStatus state={market.state} />
          {isActive && <CountdownTimer target={market.resolutionTime} />}
          {market.state === 1 && (
            <span className={`text-sm font-semibold ${market.winningOutcome === 1 ? "text-emerald-400" : "text-rose-400"}`}>
              Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">{market.question}</h1>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column - Market info */}
        <div className="space-y-6 lg:col-span-3">
          {/* Pool distribution */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Pool Distribution</h2>
            <PoolBar yesPool={market.yesPool} noPool={market.noPool} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 text-center">
                <p className="text-xl font-bold text-emerald-400">
                  {Number(formatUnits(market.yesPool, TOKEN_DECIMALS)).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">YES Pool (mUSDC)</p>
              </div>
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-4 text-center">
                <p className="text-xl font-bold text-rose-400">
                  {Number(formatUnits(market.noPool, TOKEN_DECIMALS)).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">NO Pool (mUSDC)</p>
              </div>
            </div>
          </div>

          {/* Market details */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-400 uppercase tracking-wider">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Creator</span>
                <span className="font-mono text-xs text-slate-300">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created</span>
                <span className="text-slate-300">{new Date(Number(market.createdAt) * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution</span>
                <span className="text-slate-300">{new Date(Number(market.resolutionTime) * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Creation Fee</span>
                <span className="text-slate-300">{formatUnits(market.creationFee, TOKEN_DECIMALS)} mUSDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Volume</span>
                <span className="text-amber-400 font-medium">
                  {Number(formatUnits(market.yesPool + market.noPool, TOKEN_DECIMALS)).toLocaleString()} mUSDC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-6 lg:col-span-2">
          {balance !== undefined && (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-slate-400">Your Balance</p>
              <p className="text-lg font-bold text-white">{Number(formatUnits(balance, TOKEN_DECIMALS)).toLocaleString()} mUSDC</p>
            </div>
          )}

          {bettingOpen && <BetForm marketId={marketId} onSuccess={refetch} />}

          <PositionDisplay
            marketId={marketId}
            marketState={market.state}
            yesPool={market.yesPool}
            noPool={market.noPool}
          />
        </div>
      </div>
    </div>
  );
}
