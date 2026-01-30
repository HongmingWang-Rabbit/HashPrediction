"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { HASH_PREDICTION_ADDRESS, HASH_PREDICTION_ABI, hashkeyTestnet, TOKEN_DECIMALS, DEPLOY_BLOCK } from "@/config/contracts";

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
  create: { label: "Created", emoji: "✨", color: "text-[#9f6ffd]" },
  resolve: { label: "Resolved", emoji: "⚖️", color: "text-[#ff9f2e]" },
  claim: { label: "Claimed", emoji: "💰", color: "text-[#19bf86]" },
};

const ACTIVITY_CACHE_TTL = 120_000; // 2 minutes
const activityCache = new Map<number, { data: Activity[]; at: number }>();

export function ActivityFeed({ marketId }: { marketId: number }) {
  const cached = activityCache.get(marketId);
  const [activities, setActivities] = useState<Activity[]>(cached?.data ?? []);
  const [loading, setLoading] = useState(!cached);
  const client = usePublicClient({ chainId: hashkeyTestnet.id });

  useEffect(() => {
    if (!client) return;
    if (cached && Date.now() - cached.at < ACTIVITY_CACHE_TTL) {
      setActivities(cached.data);
      setLoading(false);
      return;
    }

    async function fetchLogs() {
      try {
        // BUG-002 fix: filter by BetPlaced event signature + indexed marketId
        const betLogs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
            type: "event",
            name: "BetPlaced",
            inputs: [
              { name: "marketId", type: "uint256", indexed: true },
              { name: "bettor", type: "address", indexed: true },
              { name: "outcome", type: "uint8", indexed: false },
              { name: "amount", type: "uint256", indexed: false },
              { name: "timestamp", type: "uint256", indexed: false },
            ],
          },
          args: { marketId: BigInt(marketId) },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        const claimLogs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
            type: "event",
            name: "WinningsClaimed",
            inputs: [
              { name: "marketId", type: "uint256", indexed: true },
              { name: "bettor", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
              { name: "timestamp", type: "uint256", indexed: false },
            ],
          },
          args: { marketId: BigInt(marketId) },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        const resolveLogs = await client!.getLogs({
          address: HASH_PREDICTION_ADDRESS,
          event: {
            type: "event",
            name: "MarketResolved",
            inputs: [
              { name: "marketId", type: "uint256", indexed: true },
              { name: "winningOutcome", type: "uint8", indexed: false },
            ],
          },
          args: { marketId: BigInt(marketId) },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        });

        // BUG-001 fix: decode each log into Activity objects
        const parsed: Activity[] = [];

        for (const log of betLogs) {
          const args = log.args;
          if (!args) continue;
          parsed.push({
            type: "bet",
            user: args.bettor as string,
            amount: args.amount as bigint,
            outcome: Number(args.outcome),
            txHash: log.transactionHash ?? "",
            timestamp: Number(args.timestamp ?? 0),
          });
        }

        for (const log of claimLogs) {
          const args = log.args;
          if (!args) continue;
          parsed.push({
            type: "claim",
            user: args.bettor as string,
            amount: args.amount as bigint,
            txHash: log.transactionHash ?? "",
            timestamp: Number(args.timestamp ?? 0),
          });
        }

        for (const log of resolveLogs) {
          const args = log.args;
          if (!args) continue;
          parsed.push({
            type: "resolve",
            user: "Admin",
            outcome: Number(args.winningOutcome),
            txHash: log.transactionHash ?? "",
            timestamp: 0, // MarketResolved doesn't have timestamp field
          });
        }

        // Sort by timestamp desc, take last 20
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        const result = parsed.slice(0, 20);
        activityCache.set(marketId, { data: result, at: Date.now() });
        setActivities(result);
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
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded bg-[#3f3f46]/50 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-20 rounded bg-[#3f3f46]/50 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-[#3f3f46]/30 animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-12 rounded bg-[#3f3f46]/30 animate-pulse" />
            </div>
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
                        {a.user === "Admin" ? "Admin" : shortenAddress(a.user)}
                      </span>
                      {a.type === "bet" && a.outcome !== undefined && (
                        <span className={`ml-2 text-sm font-medium ${a.outcome === 1 ? "text-[#19bf86]" : "text-[#f8495e]"}`}>
                          {a.outcome === 1 ? "YES" : "NO"}
                        </span>
                      )}
                      {a.amount && (
                        <span className="ml-2 text-sm text-white/80">
                          {formatUnits(a.amount, TOKEN_DECIMALS)} mUSDC
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/30">
                    {a.timestamp > 0 ? timeAgo(a.timestamp) : ""}
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
