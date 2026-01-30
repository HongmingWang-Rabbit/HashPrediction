"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import type { Market } from "@/hooks/useMarkets";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "./MarketStatus";
import { CountdownTimer } from "./CountdownTimer";
import { PoolBar } from "./PoolBar";

export function MarketCard({ market }: { market: Market }) {
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
        className="glass-card p-6 transition-colors hover:border-slate-600/50"
        whileHover={{ y: -4, boxShadow: "0 0 30px rgba(245,158,11,0.25)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug text-slate-100 line-clamp-2">{market.question}</h3>
          <MarketStatus state={market.state} />
        </div>

        {/* Implied probability */}
        <div className="mb-3 flex items-center gap-2 text-xs font-medium">
          <span className="text-emerald-400">{yesPct.toFixed(0)}% YES</span>
          <span className="text-slate-600">·</span>
          <span className="text-rose-400">{noPct.toFixed(0)}% NO</span>
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
      </motion.div>
    </Link>
  );
}
