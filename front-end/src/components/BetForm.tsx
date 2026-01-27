"use client";

import { useState, useEffect } from "react";
import { parseUnits, maxUint256 } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export function BetForm({ marketId, onSuccess }: { marketId: number; onSuccess?: () => void }) {
  const [amount, setAmount] = useState("");
  const { allowance, refetch: refetchToken } = useTokenBalance();

  const { writeContract: approve, data: approveTx, isPending: approving, error: approveError } = useWriteContract();
  const { writeContract: bet, data: betTx, isPending: betting, error: betError } = useWriteContract();

  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: {
      enabled: !!approveTx,
    },
  });
  const { isLoading: waitingBet, isSuccess: betSuccess } = useWaitForTransactionReceipt({
    hash: betTx,
    query: {
      enabled: !!betTx,
    },
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
      args: [HASH_PREDICTION_ADDRESS, maxUint256],
    });
  }

  function handleBet(outcome: number) {
    if (parsedAmount === 0n) return;
    if (needsApproval) {
      handleApprove();
      return;
    }
    bet({
      address: HASH_PREDICTION_ADDRESS,
      abi: HASH_PREDICTION_ABI,
      functionName: "placeBet",
      args: [BigInt(marketId), outcome, parsedAmount],
    });
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="mb-3 text-sm font-medium text-gray-400">Place a Bet</h3>
      <input
        type="text"
        placeholder="Amount (mUSDC)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-3 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
      />
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={busy}
          className="w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
        >
          {busy ? "Approving..." : "Approve mUSDC"}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleBet(1)}
            disabled={busy || parsedAmount === 0n}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
          >
            {busy ? "..." : "Bet YES"}
          </button>
          <button
            onClick={() => handleBet(2)}
            disabled={busy || parsedAmount === 0n}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-50"
          >
            {busy ? "..." : "Bet NO"}
          </button>
        </div>
      )}
      {(approveError || betError) && (
        <p className="mt-2 text-xs text-red-400">{(approveError || betError)?.message?.split("\n")[0]}</p>
      )}
    </div>
  );
}
