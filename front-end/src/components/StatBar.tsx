"use client";

import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { AnimatedCounter } from "./AnimatedCounter";
import type { Market } from "@/hooks/useMarkets";

export function StatBar({ markets }: { markets: Market[] }) {
  const totalMarkets = markets.length;
  const activeMarkets = markets.filter((m) => m.state === 0).length;
  const totalVolume = markets.reduce((acc, m) => acc + m.yesPool + m.noPool, 0n);
  const volumeNum = Number(formatUnits(totalVolume, TOKEN_DECIMALS));

  return (
    <motion.div
      className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <span className="text-[#70707b]">
        <span className="font-semibold text-white"><AnimatedCounter value={totalMarkets} /></span> Markets
      </span>
      <span className="text-[#70707b]">
        <span className="font-semibold text-[#19bf86]"><AnimatedCounter value={activeMarkets} /></span> Active
      </span>
      <span className="text-[#70707b]">
        Vol <span className="font-semibold text-[#9f6ffd]"><AnimatedCounter value={volumeNum} suffix=" mUSDC" /></span>
      </span>
    </motion.div>
  );
}
