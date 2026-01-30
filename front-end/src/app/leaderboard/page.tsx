"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/useLeaderboard";
import { TOKEN_DECIMALS } from "@/config/contracts";

type SortKey = "wins" | "volume" | "winRate";

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortKey>("wins");
  const { entries, loading } = useLeaderboard();
  const { address } = useAccount();
  const connectedAddr = address?.toLowerCase();

  const sorted = [...entries]
    .sort((a, b) => {
      if (sortBy === "wins") return b.totalWins - a.totalWins;
      if (sortBy === "volume") return Number(b.totalVolume - a.totalVolume);
      return b.winRate - a.winRate;
    })
    .slice(0, 50);

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: "wins", label: "Wins" },
    { key: "volume", label: "Volume" },
    { key: "winRate", label: "Win Rate" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-white">
          <span className="gradient-text">Leaderboard</span>
        </h1>
        <p className="mb-6 text-slate-400">Top predictors ranked by performance</p>

        {/* Sort toggles */}
        <div className="mb-6 flex gap-2">
          {sortButtons.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === s.key
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                  : "bg-slate-800/50 text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400">No bets placed yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block glass-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 w-12">#</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4 text-right">Bets</th>
                    <th className="px-6 py-4 text-right">Wins</th>
                    <th className="px-6 py-4 text-right">Win Rate</th>
                    <th className="px-6 py-4 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((entry, i) => {
                    const isMe = connectedAddr === entry.address.toLowerCase();
                    return (
                      <motion.tr
                        key={entry.address}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-white/5 transition-colors ${
                          isMe
                            ? "bg-amber-500/10 border-l-2 border-l-amber-400"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-500">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-mono text-xs ${isMe ? "text-amber-400 font-semibold" : "text-slate-300"}`}>
                            {shortenAddress(entry.address)}
                          </span>
                          {isMe && (
                            <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                              You
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">{entry.totalBets}</td>
                        <td className="px-6 py-4 text-right text-emerald-400 font-medium">{entry.totalWins}</td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {entry.winRate.toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {Number(formatUnits(entry.totalVolume, TOKEN_DECIMALS)).toLocaleString()} mUSDC
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="sm:hidden space-y-3">
              {sorted.map((entry, i) => {
                const isMe = connectedAddr === entry.address.toLowerCase();
                return (
                  <motion.div
                    key={entry.address}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass-card p-4 ${isMe ? "border-amber-400/30 bg-amber-500/5" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-500">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                        <span className={`font-mono text-xs ${isMe ? "text-amber-400" : "text-slate-300"}`}>
                          {shortenAddress(entry.address)}
                        </span>
                        {isMe && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">You</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-emerald-400 font-bold text-sm">{entry.totalWins}</p>
                        <p className="text-slate-500">Wins</p>
                      </div>
                      <div>
                        <p className="text-slate-300 font-bold text-sm">{entry.winRate.toFixed(0)}%</p>
                        <p className="text-slate-500">Win Rate</p>
                      </div>
                      <div>
                        <p className="text-slate-300 font-bold text-sm">
                          {Number(formatUnits(entry.totalVolume, TOKEN_DECIMALS)).toLocaleString()}
                        </p>
                        <p className="text-slate-500">mUSDC</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
