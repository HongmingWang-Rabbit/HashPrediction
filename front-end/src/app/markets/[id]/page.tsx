"use client";

import { useParams } from "next/navigation";
import { formatUnits } from "viem";
import { useMarket } from "@/hooks/useMarket";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TOKEN_DECIMALS } from "@/config/contracts";
import { MarketStatus } from "@/components/MarketStatus";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PoolBar } from "@/components/PoolBar";
import { BetForm } from "@/components/BetForm";
import { PositionDisplay } from "@/components/PositionDisplay";

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const marketId = Number(id);
  const { data: market, isLoading, refetch } = useMarket(marketId);
  const { balance } = useTokenBalance();

  if (isLoading) return <p className="text-gray-500">Loading...</p>;
  if (!market) return <p className="text-gray-500">Market not found.</p>;

  const isActive = market.state === 0;
  const now = Math.floor(Date.now() / 1000);
  const bettingOpen = isActive && now < Number(market.resolutionTime);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <MarketStatus state={market.state} />
          {isActive && <CountdownTimer target={market.resolutionTime} />}
          {market.state === 1 && (
            <span className="text-sm text-blue-400">
              Winner: {market.winningOutcome === 1 ? "YES" : "NO"}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold">{market.question}</h1>
      </div>

      <PoolBar yesPool={market.yesPool} noPool={market.noPool} />

      {balance !== undefined && (
        <p className="text-sm text-gray-500">
          Balance: {formatUnits(balance, TOKEN_DECIMALS)} mUSDC
        </p>
      )}

      {bettingOpen && <BetForm marketId={marketId} onSuccess={refetch} />}

      <PositionDisplay marketId={marketId} marketState={market.state} />

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-sm text-gray-400 space-y-1">
        <p>Creator: <span className="text-gray-300 font-mono text-xs">{market.creator}</span></p>
        <p>Created: {new Date(Number(market.createdAt) * 1000).toLocaleString()}</p>
        <p>Resolution: {new Date(Number(market.resolutionTime) * 1000).toLocaleString()}</p>
        <p>Creation Fee: {formatUnits(market.creationFee, TOKEN_DECIMALS)} mUSDC</p>
      </div>
    </div>
  );
}
