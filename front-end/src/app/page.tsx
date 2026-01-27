"use client";

import { useState } from "react";
import { useMarkets } from "@/hooks/useMarkets";
import { MarketCard } from "@/components/MarketCard";

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
      <h1 className="mb-6 text-2xl font-bold">Prediction Markets</h1>
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-gray-500">Loading markets...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No markets found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MarketCard key={m.id.toString()} market={m} />
          ))}
        </div>
      )}
    </div>
  );
}
