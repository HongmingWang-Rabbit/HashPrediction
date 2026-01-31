"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { HASH_PREDICTION_ADDRESS, hashkeyTestnet, DEPLOY_BLOCK } from "@/config/contracts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  time: number;
  label: string;
  yesPct: number;
}

const CACHE_TTL = 120_000;
const cache = new Map<number, { data: DataPoint[]; at: number }>();

export function OddsChart({ marketId }: { marketId: number }) {
  const cached = cache.get(marketId);
  const [data, setData] = useState<DataPoint[]>(cached?.data ?? []);
  const [loading, setLoading] = useState(!cached);
  const client = usePublicClient({ chainId: hashkeyTestnet.id });

  useEffect(() => {
    if (!client) return;
    if (cached && Date.now() - cached.at < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    async function fetch() {
      try {
        const logs = await client!.getLogs({
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

        let yesPool = 0n;
        let noPool = 0n;
        const points: DataPoint[] = [];

        for (const log of logs) {
          const args = log.args;
          if (!args) continue;
          const outcome = Number(args.outcome);
          const amount = args.amount as bigint;
          if (outcome === 1) yesPool += amount;
          else noPool += amount;
          const total = yesPool + noPool;
          const ts = Number(args.timestamp ?? 0);
          points.push({
            time: ts,
            label: new Date(ts * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            yesPct: total > 0n ? Number((yesPool * 10000n) / total) / 100 : 50,
          });
        }

        cache.set(marketId, { data: points, at: Date.now() });
        setData(points);
      } catch (err) {
        console.error("Failed to fetch odds history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [client, marketId]);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">Odds History</h3>
        <div className="h-48 flex items-center justify-center">
          <div className="h-4 w-32 rounded bg-[#3f3f46]/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (data.length < 2) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">Odds History</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#70707b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#70707b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46" }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#17181e",
              border: "1px solid rgba(159,111,253,0.3)",
              borderRadius: "12px",
              color: "#f4f4f5",
              fontSize: 13,
            }}
            formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, "YES"]}
            labelStyle={{ color: "#70707b" }}
          />
          <Line
            type="monotone"
            dataKey="yesPct"
            stroke="#9f6ffd"
            strokeWidth={2.5}
            dot={{ fill: "#9f6ffd", r: 3 }}
            activeDot={{ r: 5, fill: "#9f6ffd", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
