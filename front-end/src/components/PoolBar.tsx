"use client";

import { formatUnits } from "viem";
import { TOKEN_DECIMALS } from "@/config/contracts";

export function PoolBar({ yesPool, noPool }: { yesPool: bigint; noPool: bigint }) {
  const total = yesPool + noPool;
  const yesPct = total > 0n ? Math.round(Number(yesPool) / Number(total) * 100) : 50;
  const noPct = total > 0n ? 100 - yesPct : 50;

  const yesFormatted = formatUnits(yesPool, TOKEN_DECIMALS);
  const noFormatted = formatUnits(noPool, TOKEN_DECIMALS);

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-green-400">YES {yesPct}% ({yesFormatted})</span>
        <span className="text-red-400">NO {noPct}% ({noFormatted})</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-gray-800">
        <div className="bg-green-500 transition-all" style={{ width: `${yesPct}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${noPct}%` }} />
      </div>
    </div>
  );
}
