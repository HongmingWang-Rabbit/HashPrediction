"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, hashkeyTestnet, TOKEN_DECIMALS } from "@/config/contracts";
import { formatUnits } from "viem";

interface Activity {
  type: "bet" | "create" | "resolve" | "claim";
  user: string;
  amount?: bigint;
  outcome?: number;
  txHash: string;
  timestamp: number;
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeConfig = {
  bet: { label: "Bet", emoji: "🎲", color: "text-blue-400" },
  create: { label: "Created", emoji: "✨", color: "text-purple-400" },
  resolve: { label: "Resolved", emoji: "⚖️", color: "text-yellow-400" },
  claim: { label: "Claimed", emoji: "💰", color: "text-green-400" },
};

export function ActivityFeed({ marketId }: { marketId: number }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const client = usePublicClient({ chainId: hashkeyTestnet.id });

  useEffect(() => {
    if (!client) return;

    async function fetchLogs() {
      try {
        // Fetch MarketCreated and bet events for this market
        const logs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          fromBlock: "earliest",
          toBlock: "latest",
        });

        // Parse events we recognize - MarketCreated has topic for marketId
        const parsed: Activity[] = [];

        // For now show a simple "no events" state until we have indexed events
        // Real implementation would decode each log based on event signature
        setActivities(parsed);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [client, marketId]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Activity</h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-white/40">No activity yet for this market.</p>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {activities.map((a, i) => {
              const cfg = typeConfig[a.type];
              return (
                <motion.div
                  key={a.txHash + i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cfg.emoji}</span>
                    <div>
                      <span className={`text-sm font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="ml-2 text-sm text-white/60">
                        {shortenAddress(a.user)}
                      </span>
                      {a.amount && (
                        <span className="ml-2 text-sm text-white/80">
                          {formatUnits(a.amount, TOKEN_DECIMALS)} mUSDC
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/30">
                    {timeAgo(a.timestamp)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
