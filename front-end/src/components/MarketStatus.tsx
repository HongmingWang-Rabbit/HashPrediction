"use client";

import React from "react";

const config = [
  { label: "Active", dot: "bg-[#19bf86]", bg: "bg-[#19bf86]/10", text: "text-[#19bf86]", border: "border-[#19bf86]/20" },
  { label: "Resolved", dot: "bg-blue-400", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  { label: "Cancelled", dot: "bg-[#f8495e]", bg: "bg-[#f8495e]/10", text: "text-[#f8495e]", border: "border-[#f8495e]/20" },
] as const;

const endedConfig = { label: "Ended", dot: "bg-slate-400", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };

export const MarketStatus = React.memo(function MarketStatus({ state, resolutionTime }: { state: number; resolutionTime?: bigint }) {
  const now = Math.floor(Date.now() / 1000);
  const ended = state === 0 && resolutionTime !== undefined && now >= Number(resolutionTime);
  const c = ended ? endedConfig : (config[state] ?? config[0]);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.bg} ${c.text} ${c.border}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
});
