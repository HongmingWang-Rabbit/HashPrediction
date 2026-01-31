"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import type { Market } from "@/hooks/useMarkets";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "./MarketStatus";
import { CountdownTimer } from "./CountdownTimer";
import { PoolBar } from "./PoolBar";
import { getCategoryLabel } from "@/lib/categories";

function humanizeTimeLeft(resolutionTime: bigint): string | null {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(resolutionTime) - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / 60);
  return `${mins}m left`;
}

export const MarketCard = React.memo(function MarketCard({ market }: { market: Market }) {
  const volume = Number(formatUnits(market.yesPool + market.noPool, TOKEN_DECIMALS));
  const totalPool = market.yesPool + market.noPool;
  const yesPct = totalPool > 0n ? Number((market.yesPool * 10000n) / totalPool) / 100 : 50;
  const noPct = totalPool > 0n ? Math.round((100 - yesPct) * 100) / 100 : 50;

  return (
    <Link
      href={`/markets/${market.id.toString()}`}
      className="block"
    >
      <motion.div
        className="glass-card p-6 transition-colors hover:border-[#3f3f46]/50"
        whileHover={{ y: -4, boxShadow: "0 0 30px rgba(159,111,253,0.25)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[#17181e] px-2 py-0.5 text-[10px] text-[#a1a1aa]">
            {getCategoryLabel(market.category)}
          </span>
          <MarketStatus state={market.state} resolutionTime={market.resolutionTime} />
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold leading-snug text-[#f4f4f5] line-clamp-2">{market.question}</h3>
        </div>

        {/* Implied probability */}
        <div className="mb-3 flex items-center gap-2 text-xs font-medium">
          <span className="text-[#19bf86]">{yesPct.toFixed(0)}% YES</span>
          <span className="text-[#3f3f46]">·</span>
          <span className="text-[#f8495e]">{noPct.toFixed(0)}% NO</span>
        </div>

        <PoolBar yesPool={market.yesPool} noPool={market.noPool} />

        <div className="mt-4 flex items-center justify-between">
          <div>
            {market.state === 0 && (
              <div className="flex items-center gap-2">
                <CountdownTimer target={market.resolutionTime} />
                {humanizeTimeLeft(market.resolutionTime) && (
                  <span className="text-[10px] text-[#70707b]">({humanizeTimeLeft(market.resolutionTime)})</span>
                )}
              </div>
            )}
            {market.state === 1 && (
              <span className={`text-sm font-medium ${market.winningOutcome === 1 ? "text-[#19bf86]" : "text-[#f8495e]"}`}>
                Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
              </span>
            )}
          </div>
          {volume > 0 && (
            <span className="rounded-full bg-[#17181e] px-2.5 py-0.5 text-xs text-[#70707b]">
              {volume.toLocaleString()} mUSDC
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
});
