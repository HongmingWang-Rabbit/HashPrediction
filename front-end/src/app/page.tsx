"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMarkets } from "@/hooks/useMarkets";
import { MarketCard } from "@/components/MarketCard";
import { StatBar } from "@/components/StatBar";
import { SkeletonCard } from "@/components/Skeleton";
import { CATEGORIES } from "@/lib/categories";

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

function HeroSection({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      className="glass-card relative mb-8 overflow-hidden border-[#9f6ffd]/20 p-8 sm:p-10"
      style={{ background: "linear-gradient(135deg, rgba(159,111,253,0.08) 0%, rgba(17,24,39,0.5) 100%)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      transition={{ duration: 0.6 }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-[#70707b] hover:text-white transition-colors text-lg"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        Trade on What You <span className="gradient-text">Believe</span>
      </h2>
      <p className="text-[#a1a1aa] mb-6 text-sm sm:text-base">
        Binary prediction markets on HashKey Chain
      </p>
      <div className="flex flex-wrap gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9f6ffd]/20 text-xs font-bold text-[#9f6ffd]">1</span>
          <span className="text-[#d1d1d6]">Pick a market</span>
        </div>
        <span className="text-[#3f3f46] hidden sm:block">→</span>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9f6ffd]/20 text-xs font-bold text-[#9f6ffd]">2</span>
          <span className="text-[#d1d1d6]">Place your bet</span>
        </div>
        <span className="text-[#3f3f46] hidden sm:block">→</span>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9f6ffd]/20 text-xs font-bold text-[#9f6ffd]">3</span>
          <span className="text-[#d1d1d6]">Win if you&apos;re right</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href="#markets" className="rounded-xl bg-[#9f6ffd]/10 border border-[#9f6ffd]/30 px-5 py-2.5 text-sm font-semibold text-[#9f6ffd] hover:bg-[#9f6ffd]/20 transition-all">
          Browse Markets
        </a>
        <Link href="/create" className="rounded-xl gradient-cta px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all">
          Create Market
        </Link>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<Sort>("Newest");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showHero, setShowHero] = useState(false);
  const { data: markets, isLoading } = useMarkets();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowHero(!localStorage.getItem("hashprediction_hero_dismissed"));
    }
  }, []);

  const dismissHero = () => {
    setShowHero(false);
    localStorage.setItem("hashprediction_hero_dismissed", "1");
  };

  const now = Math.floor(Date.now() / 1000);
  const isEnded = (m: (typeof markets)[number]) => m.state === 0 && now >= Number(m.resolutionTime);

  const filtered = markets.filter((m) => {
    if (isEnded(m)) return false;
    if (filter === "Active") { if (m.state !== 0) return false; }
    else if (filter === "Resolved") { if (m.state !== 1) return false; }
    else if (filter === "Cancelled") { if (m.state !== 2) return false; }
    if (categoryFilter && m.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Volume") return Number((b.yesPool + b.noPool) - (a.yesPool + a.noPool));
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

      <AnimatePresence>
        {showHero && <HeroSection onDismiss={dismissHero} />}
      </AnimatePresence>

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

      {/* Ending Soon section */}
      {(() => {
        const endingSoon = markets.filter(
          (m) => m.state === 0 && !isEnded(m) && Number(m.resolutionTime) - now <= 86400 && Number(m.resolutionTime) - now > 0
        ).sort((a, b) => Number(a.resolutionTime) - Number(b.resolutionTime));
        if (endingSoon.length === 0) return null;
        return (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-3 text-lg font-bold text-white flex items-center gap-2">
              🔥 <span className="gradient-text">Ending Soon</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {endingSoon.map((m) => (
                <div key={m.id.toString()} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                  <MarketCard market={m} />
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}

      {/* State filters + sort */}
      <div className="mb-3 flex flex-wrap items-center gap-2 relative">
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

      {/* Category filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            categoryFilter === null
              ? "bg-[#9f6ffd]/15 text-[#9f6ffd] border border-[#9f6ffd]/30"
              : "text-[#70707b] hover:text-[#d1d1d6] border border-transparent"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategoryFilter(c.hash)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === c.hash
                ? "bg-[#9f6ffd]/15 text-[#9f6ffd] border border-[#9f6ffd]/30"
                : "text-[#70707b] hover:text-[#d1d1d6] border border-transparent"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div id="markets" className="mb-6 relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#70707b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search markets..."
          className="input-field w-full pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70707b] hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
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
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          layout
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((m) => (
              <motion.div
                key={m.id.toString()}
                variants={cardVariants}
                layout
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <MarketCard market={m} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
