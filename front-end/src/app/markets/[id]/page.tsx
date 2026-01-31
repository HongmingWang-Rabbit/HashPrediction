"use client";

import { useState } from "react";
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
import { OddsChart } from "@/components/OddsChart";
import { MarketComments } from "@/components/MarketComments";
import { PageSkeleton } from "@/components/PageSkeleton";

function RulesTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9f6ffd]/20 text-[10px] font-bold text-[#9f6ffd]">?</span>
        <span className="text-sm font-medium text-[#d1d1d6]">How it works</span>
        <svg className={`ml-auto h-4 w-4 text-[#70707b] transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-xs text-[#a1a1aa] border-t border-white/5 pt-3">
          <p><span className="text-white font-medium">1. Pick a side</span> — Bet YES or NO on the outcome</p>
          <p><span className="text-white font-medium">2. Pool-based odds</span> — Your payout depends on the ratio of the pool. More bets on your side = lower payout per token</p>
          <p><span className="text-white font-medium">3. Payout formula</span> — If you win: (your bet ÷ winning pool) × total pool</p>
          <p><span className="text-white font-medium">4. Resolution</span> — Admin resolves the market after the deadline. Winners can then claim</p>
          <p><span className="text-white font-medium">5. Cancellation</span> — If cancelled, all bets are fully refunded</p>
        </div>
      )}
    </div>
  );
}

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { data: market, isLoading, refetch } = useMarket(marketId);
  const { balance } = useTokenBalance();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }
  if (!market) return (
    <div className="glass-card mx-auto max-w-lg p-12 text-center">
      <p className="text-[#70707b] mb-4">Market not found.</p>
      <a href="/" className="inline-block rounded-xl gradient-cta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">
        ← Back to Markets
      </a>
    </div>
  );

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
          <span className="text-sm text-[#70707b]">YES</span>
          <span className="text-[#3f3f46]">·</span>
          <span className="text-2xl font-bold text-[#f8495e]">{noPct.toFixed(0)}%</span>
          <span className="text-sm text-[#70707b]">NO</span>
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
                <p className="text-xs text-[#70707b] mt-1">YES Pool (mUSDC)</p>
              </div>
              <div className="rounded-xl bg-[#f8495e]/5 border border-[#f8495e]/10 p-4 text-center">
                <p className="text-lg sm:text-xl font-bold text-[#f8495e] truncate">
                  {Number(formatUnits(market.noPool, TOKEN_DECIMALS)).toLocaleString()}
                </p>
                <p className="text-xs text-[#70707b] mt-1">NO Pool (mUSDC)</p>
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

        {/* Right column - Actions (shown first on mobile for primary action) */}
        <div className="order-first md:order-none space-y-6 md:col-span-2 lg:col-span-2">
          {balance !== undefined && (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-[#70707b]">Your Balance</p>
              <p className="text-lg font-bold text-white">{Number(formatUnits(balance, TOKEN_DECIMALS)).toLocaleString()} mUSDC</p>
            </div>
          )}

          {bettingOpen && (
            <>
              <RulesTooltip />
              <BetForm marketId={marketId} yesPool={market.yesPool} noPool={market.noPool} onSuccess={refetch} />
            </>
          )}

        </div>
      </div>

      {/* Your Position — full width below the grid */}
      <div className="mt-6">
        <PositionDisplay
          marketId={marketId}
          marketState={market.state}
          yesPool={market.yesPool}
          noPool={market.noPool}
        />
      </div>

      {/* Odds History Chart */}
      <div className="mt-8">
        <OddsChart marketId={marketId} />
      </div>

      {/* Comments */}
      <div className="mt-6">
        <MarketComments marketId={marketId} />
      </div>

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed marketId={marketId} />
      </div>
    </motion.div>
  );
}
