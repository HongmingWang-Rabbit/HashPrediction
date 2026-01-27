"use client";

import Link from "next/link";
import type { Market } from "@/hooks/useMarkets";
import { MarketStatus } from "./MarketStatus";
import { CountdownTimer } from "./CountdownTimer";
import { PoolBar } from "./PoolBar";

export function MarketCard({ market }: { market: Market }) {
  return (
    <Link
      href={`/markets/${market.id.toString()}`}
      className="block rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{market.question}</h3>
        <MarketStatus state={market.state} />
      </div>
      <PoolBar yesPool={market.yesPool} noPool={market.noPool} />
      <div className="mt-3">
        {market.state === 0 && <CountdownTimer target={market.resolutionTime} />}
        {market.state === 1 && (
          <span className="text-sm text-blue-400">
            Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
          </span>
        )}
      </div>
    </Link>
  );
}
