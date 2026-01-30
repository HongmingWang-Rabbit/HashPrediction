"use client";

import React from "react";
import { formatUnits } from "viem";
import { TOKEN_DECIMALS } from "@/config/contracts";

export const PoolBar = React.memo(function PoolBar({ yesPool, noPool }: { yesPool: bigint; noPool: bigint }) {
  const total = yesPool + noPool;
  const yesPct = total > 0n ? Math.round(Number(yesPool) / Number(total) * 100) : 50;
  const noPct = total > 0n ? 100 - yesPct : 50;

  const yesFormatted = Number(formatUnits(yesPool, TOKEN_DECIMALS)).toLocaleString();
  const noFormatted = Number(formatUnits(noPool, TOKEN_DECIMALS)).toLocaleString();

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs sm:text-sm font-medium">
        <span className="text-[#19bf86] truncate">YES {yesPct}%<span className="ml-1 text-[#70707b]">({yesFormatted})</span></span>
        <span className="text-[#f8495e] truncate text-right">NO {noPct}%<span className="ml-1 text-[#70707b]">({noFormatted})</span></span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[#17181e]">
        <div
          className="bg-[#19bf86] transition-all duration-500"
          style={{ width: `${yesPct}%`, boxShadow: yesPct > 5 ? "0 0 8px rgba(16,185,129,0.4)" : "none" }}
        />
        <div
          className="bg-[#f8495e] transition-all duration-500"
          style={{ width: `${noPct}%`, boxShadow: noPct > 5 ? "0 0 8px rgba(244,63,94,0.4)" : "none" }}
        />
      </div>
    </div>
  );
});
