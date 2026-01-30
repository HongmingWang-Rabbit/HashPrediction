"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarkets } from "@/hooks/useMarkets";
import { MarketCard } from "@/components/MarketCard";
import { StatBar } from "@/components/StatBar";
import { SkeletonCard } from "@/components/Skeleton";

const FILTERS = ["All", "Active", "Resolved", "Cancelled"] as const;
const SORTS = ["Newest", "Volume"] as const;
type Sort = (typeof SORTS)[number];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<Sort>("Newest");
  const { data: markets, isLoading } = useMarkets();

  const now = Math.floor(Date.now() / 1000);
  const isEnded = (m: (typeof markets)[number]) => m.state === 0 && now >= Number(m.resolutionTime);

  const filtered = markets.filter((m) => {
    if (isEnded(m)) return false;
    if (filter === "Active") return m.state === 0;
    if (filter === "Resolved") return m.state === 1;
    if (filter === "Cancelled") return m.state === 2;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Volume") return Number((b.yesPool + b.noPool) - (a.yesPool + a.noPool));
    // Newest: active first, then by id desc
    if (a.state !== b.state) {
      if (a.state === 0) return -1;
      if (b.state === 0) return 1;
    }
    return Number(b.id - a.id);
  });

  return (
    <div className="relative">
      {/* Background glow */}
      <motion.div
        className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#9f6ffd]/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="pointer-events-none absolute top-40 -left-20 h-72 w-72 rounded-full bg-[#9f6ffd]/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <motion.h1
        className="mb-2 text-2xl sm:text-3xl font-bold text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="gradient-text">Prediction Markets</span>
      </motion.h1>
      <motion.p
        className="mb-8 text-[#70707b]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Trade on the outcome of real-world events
      </motion.p>

      {markets.length > 0 && <StatBar markets={markets} />}

      <div className="mb-6 flex flex-wrap items-center gap-2 relative">
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              filter === f
                ? "text-[#9f6ffd]"
                : "text-[#70707b] hover:text-white hover:bg-[#17181e]/50"
            }`}
          >
            {filter === f && (
              <motion.span
                layoutId="filterIndicator"
                className="absolute inset-0 rounded-xl bg-[#9f6ffd]/10 border border-[#9f6ffd]/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </motion.button>
        ))}

        <span className="mx-2 h-5 w-px bg-[#3f3f46]/50" />

        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sort === s
                ? "bg-[#3f3f46]/50 text-white"
                : "text-[#70707b] hover:text-[#d1d1d6]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div
          className="glass-card p-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[#70707b] mb-3">No markets found.</p>
          <a href="/create" className="inline-block rounded-xl gradient-cta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">
            Create a Market
          </a>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${sort}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sorted.map((m) => (
              <motion.div key={m.id.toString()} variants={cardVariants}>
                <MarketCard market={m} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
