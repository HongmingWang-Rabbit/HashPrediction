"use client";

const labels = ["Active", "Resolved", "Cancelled"] as const;
const colors = [
  "bg-green-500/20 text-green-400",
  "bg-blue-500/20 text-blue-400",
  "bg-red-500/20 text-red-400",
] as const;

export function MarketStatus({ state }: { state: number }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[state] ?? colors[0]}`}>
      {labels[state] ?? "Unknown"}
    </span>
  );
}
