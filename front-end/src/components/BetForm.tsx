"use client";

import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useTokenBalance } from "@/hooks/useTokenBalance";

const PRESETS = ["10", "50", "100", "500"];

export function BetForm({ marketId, onSuccess }: { marketId: number; onSuccess?: () => void }) {
  const [amount, setAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<1 | 2>(1);
  const { allowance, refetch: refetchToken } = useTokenBalance();

  const { writeContract: approve, data: approveTx, isPending: approving, error: approveError } = useWriteContract();
  const { writeContract: bet, data: betTx, isPending: betting, error: betError } = useWriteContract();

  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: { enabled: !!approveTx },
  });
  const { isLoading: waitingBet, isSuccess: betSuccess } = useWaitForTransactionReceipt({
    hash: betTx,
    query: { enabled: !!betTx },
  });

  useEffect(() => {
    if (approveSuccess) refetchToken();
  }, [approveSuccess, refetchToken]);

  useEffect(() => {
    if (betSuccess) {
      refetchToken();
      onSuccess?.();
    }
  }, [betSuccess, refetchToken, onSuccess]);

  const parsedAmount = (() => {
    try { return parseUnits(amount, TOKEN_DECIMALS); } catch { return 0n; }
  })();

  const needsApproval = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;
  const busy = approving || waitingApprove || betting || waitingBet;

  function handleApprove() {
    approve({
      address: MOCK_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [HASH_PREDICTION_ADDRESS, parsedAmount],
    });
  }

  function handleBet() {
    if (parsedAmount === 0n) return;
    if (needsApproval) {
      handleApprove();
      return;
    }
    bet({
      address: HASH_PREDICTION_ADDRESS,
      abi: HASH_PREDICTION_ABI,
      functionName: "placeBet",
      args: [BigInt(marketId), selectedOutcome, parsedAmount],
    });
  }

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-base font-semibold text-white">Place a Bet</h3>

      {/* Outcome toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-800/50 p-1">
        <button
          onClick={() => setSelectedOutcome(1)}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
            selectedOutcome === 1
              ? "bg-emerald-500 text-white shadow-lg glow-yes"
              : "text-slate-400 hover:text-white"
          }`}
        >
          YES
        </button>
        <button
          onClick={() => setSelectedOutcome(2)}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
            selectedOutcome === 2
              ? "bg-rose-500 text-white shadow-lg glow-no"
              : "text-slate-400 hover:text-white"
          }`}
        >
          NO
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Amount (mUSDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Presets */}
      <div className="mb-4 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setAmount(p)}
            className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
              amount === p
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-slate-800/50 text-slate-400 hover:text-white border border-transparent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Action button */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={busy}
          className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {busy ? "Approving..." : "Approve mUSDC"}
        </button>
      ) : (
        <button
          onClick={handleBet}
          disabled={busy || parsedAmount === 0n}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
            selectedOutcome === 1
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-rose-600 hover:bg-rose-500"
          }`}
        >
          {busy ? "Placing bet..." : `Bet ${selectedOutcome === 1 ? "YES" : "NO"}`}
        </button>
      )}

      {(approveError || betError) && (
        <p className="mt-3 text-xs text-rose-400">{(approveError || betError)?.message?.split("\n")[0]}</p>
      )}
    </div>
  );
}
