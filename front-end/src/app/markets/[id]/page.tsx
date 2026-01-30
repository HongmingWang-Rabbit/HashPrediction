"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { useMarket } from "@/hooks/useMarket";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TOKEN_DECIMALS, HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI } from "@/config/contracts";
import { MarketStatus } from "@/components/MarketStatus";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PoolBar } from "@/components/PoolBar";
import { BetForm } from "@/components/BetForm";
import { PositionDisplay } from "@/components/PositionDisplay";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { data: market, isLoading, refetch } = useMarket(marketId);
  const { balance } = useTokenBalance();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="skeleton h-8 w-64 rounded-lg mb-4" />
        <div className="skeleton h-6 w-full rounded-lg mb-6" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }
  if (!market) return <p className="text-[#f4f4f5]0">Market not found.</p>;

  const isActive = market.state === 0;
  const now = Math.floor(Date.now() / 1000);
  const bettingOpen = isActive && now < Number(market.resolutionTime);

  const totalPool = market.yesPool + market.noPool;
  const yesPct = totalPool > 0n ? Number((market.yesPool * 10000n) / totalPool) / 100 : 50;
  const noPct = Math.round((100 - yesPct) * 100) / 100;

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: market?.question ?? '',
      text: `Check out this prediction market: ${market?.question ?? ''}`,
      url,
    };
    // Use native share on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      className="mx-auto max-w-5xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <MarketStatus state={market.state} />
          {isActive && <CountdownTimer target={market.resolutionTime} />}
          {market.state === 1 && (
            <span className={`text-sm font-semibold ${market.winningOutcome === 1 ? "text-[#19bf86]" : "text-[#f8495e]"}`}>
              Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
            </span>
          )}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#17181e]/50 px-3 py-1.5 text-xs text-[#70707b] hover:text-white transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {copied ? "Link copied!" : "Share"}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white">{market.question}</h1>
        {/* Implied probability */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-[#19bf86]">{yesPct.toFixed(0)}%</span>
          <span className="text-sm text-[#f4f4f5]0">YES</span>
          <span className="text-[#3f3f46]">·</span>
          <span className="text-2xl font-bold text-[#f8495e]">{noPct.toFixed(0)}%</span>
          <span className="text-sm text-[#f4f4f5]0">NO</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-5 lg:grid-cols-5">
        {/* Left column - Market info */}
        <div className="space-y-6 md:col-span-3 lg:col-span-3">
          {/* Pool distribution */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">Pool Distribution</h2>
            <PoolBar yesPool={market.yesPool} noPool={market.noPool} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#19bf86]/5 border border-[#19bf86]/10 p-4 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#19bf86] truncate">
                  {Number(formatUnits(market.yesPool, TOKEN_DECIMALS)).toLocaleString()}
                </p>
                <p className="text-xs text-[#f4f4f5]0 mt-1">YES Pool (mUSDC)</p>
              </div>
              <div className="rounded-xl bg-[#f8495e]/5 border border-[#f8495e]/10 p-4 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#f8495e] truncate">
                  {Number(formatUnits(market.noPool, TOKEN_DECIMALS)).toLocaleString()}
                </p>
                <p className="text-xs text-[#f4f4f5]0 mt-1">NO Pool (mUSDC)</p>
              </div>
            </div>
          </div>

          {/* Market details */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#70707b]">Creator</span>
                <span className="font-mono text-xs text-[#d1d1d6]">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70707b]">Created</span>
                <span className="text-[#d1d1d6]">{new Date(Number(market.createdAt) * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70707b]">Resolution</span>
                <span className="text-[#d1d1d6]">{new Date(Number(market.resolutionTime) * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70707b]">Creation Fee</span>
                <span className="text-[#d1d1d6]">{formatUnits(market.creationFee, TOKEN_DECIMALS)} mUSDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#70707b]">Total Volume</span>
                <span className="text-[#9f6ffd] font-medium">
                  {Number(formatUnits(market.yesPool + market.noPool, TOKEN_DECIMALS)).toLocaleString()} mUSDC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-6 md:col-span-2 lg:col-span-2">
          {balance !== undefined && (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-[#70707b]">Your Balance</p>
              <p className="text-lg font-bold text-white">{Number(formatUnits(balance, TOKEN_DECIMALS)).toLocaleString()} mUSDC</p>
            </div>
          )}

          {bettingOpen && <BetForm marketId={marketId} yesPool={market.yesPool} noPool={market.noPool} onSuccess={refetch} />}

          <PositionDisplay
            marketId={marketId}
            marketState={market.state}
            yesPool={market.yesPool}
            noPool={market.noPool}
          />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mt-8">
        <ActivityFeed marketId={marketId} />
      </div>
    </motion.div>
  );
}
