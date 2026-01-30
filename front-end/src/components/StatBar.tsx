"use client";

import { formatUnits } from "viem";
import { TOKEN_DECIMALS } from "@/config/contracts";
import type { Market } from "@/hooks/useMarkets";

export function StatBar({ markets }: { markets: Market[] }) {
  const totalMarkets = markets.length;
  const activeMarkets = markets.filter((m) => m.state === 0).length;
  const totalVolume = markets.reduce((acc, m) => acc + m.yesPool + m.noPool, 0n);

  const stats = [
    { label: "Total Markets", value: totalMarkets.toString() },
    { label: "Active", value: activeMarkets.toString() },
    { label: "Total Volume", value: `${Number(formatUnits(totalVolume, TOKEN_DECIMALS)).toLocaleString()} mUSDC` },
  ];

  return (
    <div className="glass-card mb-8 grid grid-cols-3 divide-x divide-slate-700/50">
      {stats.map((stat) => (
        <div key={stat.label} className="px-6 py-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
          <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
