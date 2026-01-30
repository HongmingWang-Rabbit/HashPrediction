"use client";

import { useState } from "react";
import { useMarkets } from "@/hooks/useMarkets";
import { MarketCard } from "@/components/MarketCard";
import { StatBar } from "@/components/StatBar";
import { SkeletonCard } from "@/components/Skeleton";

const FILTERS = ["All", "Active", "Resolved", "Cancelled"] as const;

export default function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { data: markets, isLoading } = useMarkets();

  const filtered = markets.filter((m) => {
    if (filter === "Active") return m.state === 0;
    if (filter === "Resolved") return m.state === 1;
    if (filter === "Cancelled") return m.state === 2;
    return true;
  });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Prediction Markets</h1>
      <p className="mb-8 text-slate-400">Trade on the outcome of real-world events</p>

      {markets.length > 0 && <StatBar markets={markets} />}

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              filter === f
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400">No markets found.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MarketCard key={m.id.toString()} market={m} />
          ))}
        </div>
      )}
    </div>
  );
}
