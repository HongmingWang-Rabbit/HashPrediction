"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import type { Market } from "@/hooks/useMarkets";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "./MarketStatus";
import { CountdownTimer } from "./CountdownTimer";
import { PoolBar } from "./PoolBar";

export function MarketCard({ market }: { market: Market }) {
  const volume = Number(formatUnits(market.yesPool + market.noPool, TOKEN_DECIMALS));

  return (
    <Link
      href={`/markets/${market.id.toString()}`}
      className="glass-card block p-6 transition-all hover:border-slate-600/50 hover:glow-primary"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-slate-100 line-clamp-2">{market.question}</h3>
        <MarketStatus state={market.state} />
      </div>

      <PoolBar yesPool={market.yesPool} noPool={market.noPool} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          {market.state === 0 && <CountdownTimer target={market.resolutionTime} />}
          {market.state === 1 && (
            <span className={`text-sm font-medium ${market.winningOutcome === 1 ? "text-emerald-400" : "text-rose-400"}`}>
              Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
            </span>
          )}
        </div>
        {volume > 0 && (
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
            {volume.toLocaleString()} mUSDC
          </span>
        )}
      </div>
    </Link>
  );
}
