"use client";

import { useState, useEffect, useCallback } from "react";
import { parseUnits, formatUnits } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  TOKEN_DECIMALS,
} from "@/config/contracts";
const PRESETS = ["10", "50", "100", "500"];

function PayoutPreview({ amount, outcome, yesPool, noPool }: { amount: bigint; outcome: 1 | 2; yesPool: bigint; noPool: bigint }) {
  if (amount <= 0n) {
    return (
      <div className="mb-4 rounded-lg border border-[#3f3f46]/50 bg-[#17181e]/30 px-4 py-3 text-sm text-[#f4f4f5]0">
        Potential Return: —
      </div>
    );
  }

  const winningPool = outcome === 1 ? yesPool : noPool;
  const losingPool = outcome === 1 ? noPool : yesPool;
  const totalWinning = winningPool + amount;

  // payout = amount + (amount * losingPool) / (winningPool + amount)
  const payout = totalWinning > 0n
    ? amount + (amount * losingPool) / totalWinning
    : amount;

  const multiplier = Number(payout) / Number(amount);
  const payoutStr = Number(formatUnits(payout, TOKEN_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="mb-4 rounded-lg border border-[#9f6ffd]/20 bg-[#9f6ffd]/5 px-4 py-3 text-sm">
      <span className="text-[#70707b]">Potential Return: </span>
      <span className="font-semibold text-[#9f6ffd]">{payoutStr} mUSDC</span>
      <span className="ml-1.5 text-[#9f6ffd]/70">({multiplier.toFixed(2)}x)</span>
    </div>
  );
}

function RulesExplainer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-xs font-medium text-[#70707b] hover:text-[#f4f4f5] transition-colors"
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        How prediction markets work
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-[#3f3f46]/50 bg-[#17181e]/40 p-3.5 text-xs leading-relaxed text-[#d1d1d6] space-y-2">
          <p>
            <span className="font-semibold text-[#9f6ffd]">1. Pick an outcome</span> — Choose{" "}
            <span className="text-[#19bf86] font-medium">YES</span> or{" "}
            <span className="text-[#f8495e] font-medium">NO</span> and enter the amount of mUSDC you
            want to bet.
          </p>
          <p>
            <span className="font-semibold text-[#9f6ffd]">2. Pool-based payouts</span> — All bets
            go into a shared pool. If your side wins, you receive a share of the <em>entire</em>{" "}
            pool proportional to your contribution.
          </p>
          <p>
            <span className="font-semibold text-[#9f6ffd]">3. Potential return</span> — The less
            popular the winning side, the higher the payout per token. Early bets on the correct
            outcome earn the most.
          </p>
          <p>
            <span className="font-semibold text-[#9f6ffd]">4. Resolution</span> — After the
            deadline, an admin resolves the market. Winners can then claim their payout; losers
            forfeit their bet.
          </p>
          <p>
            <span className="font-semibold text-[#9f6ffd]">5. Fees</span> — A small fee is deducted
            at market creation. There are no additional fees on bets or claims.
          </p>
        </div>
      )}
    </div>
  );
}

type Toast = { type: "success" | "error"; message: string } | null;

export function BetForm({ marketId, yesPool, noPool, onSuccess, allowance, balance, refetchToken }: { marketId: number; yesPool?: bigint; noPool?: bigint; onSuccess?: () => void; allowance?: bigint; balance?: bigint; refetchToken: () => void }) {
  const [amount, setAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<1 | 2>(1);
  const [toast, setToast] = useState<Toast>(null);

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

  const showToast = useCallback((t: Toast) => {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (approveSuccess) {
      refetchToken();
      showToast({ type: "success", message: "Approval successful" });
    }
  }, [approveSuccess, refetchToken, showToast]);

  useEffect(() => {
    if (betSuccess) {
      refetchToken();
      setAmount("");
      showToast({ type: "success", message: "Bet placed! 🎉 Share your prediction with friends." });
      onSuccess?.();
    }
  }, [betSuccess, refetchToken, onSuccess, showToast]);

  useEffect(() => {
    if (approveError) showToast({ type: "error", message: approveError.message?.split("\n")[0] ?? "Approval failed" });
  }, [approveError, showToast]);

  useEffect(() => {
    if (betError) showToast({ type: "error", message: betError.message?.split("\n")[0] ?? "Bet failed" });
  }, [betError, showToast]);

  const parsedAmount = (() => {
    try { return parseUnits(amount, TOKEN_DECIMALS); } catch { return 0n; }
  })();

  const needsApproval = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;
  const insufficientBalance = balance !== undefined && parsedAmount > 0n && balance < parsedAmount;
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

      {/* Toast */}
      {toast && (
        <div
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm font-medium ${
            toast.type === "success"
              ? "bg-[#19bf86]/10 text-[#19bf86] border border-[#19bf86]/20"
              : "bg-[#f8495e]/10 text-[#f8495e] border border-[#f8495e]/20"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Outcome toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-[#17181e]/50 p-1">
        <button
          onClick={() => setSelectedOutcome(1)}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
            selectedOutcome === 1
              ? "bg-[#19bf86] text-white shadow-lg glow-yes"
              : "text-[#70707b] hover:text-white"
          }`}
        >
          YES
        </button>
        <button
          onClick={() => setSelectedOutcome(2)}
          className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
            selectedOutcome === 2
              ? "bg-[#f8495e] text-white shadow-lg glow-no"
              : "text-[#70707b] hover:text-white"
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
                ? "bg-[#9f6ffd]/20 text-[#9f6ffd] border border-[#9f6ffd]/30"
                : "bg-[#17181e]/50 text-[#70707b] hover:text-white border border-transparent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Payout preview */}
      <PayoutPreview
        amount={parsedAmount}
        outcome={selectedOutcome}
        yesPool={yesPool ?? 0n}
        noPool={noPool ?? 0n}
      />

      {/* Rules explanation */}
      <RulesExplainer />

      {/* Action button */}
      {insufficientBalance ? (
        <button
          disabled
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 bg-slate-700"
        >
          Insufficient Balance
        </button>
      ) : needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={busy}
          className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {busy ? "Approving..." : "Approve mUSDC"}
        </button>
      ) : (
        <button
          onClick={handleBet}
          disabled={busy || parsedAmount === 0n}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
            selectedOutcome === 1
              ? "bg-[#19bf86] hover:bg-[#19bf86]"
              : "bg-[#f8495e] hover:bg-[#f8495e]"
          }`}
        >
          {busy ? "Placing bet..." : `Bet ${selectedOutcome === 1 ? "YES" : "NO"}`}
        </button>
      )}
    </div>
  );
}
