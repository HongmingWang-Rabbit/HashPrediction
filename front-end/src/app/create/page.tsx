"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseUnits, maxUint256, decodeEventLog } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { allowance, refetch: refetchToken } = useTokenBalance();

  const [question, setQuestion] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");

  const { writeContract: approve, data: approveTx, isPending: approving, error: approveError } = useWriteContract();
  const { writeContract: create, data: createTx, isPending: creating, error: createError } = useWriteContract();

  const { isLoading: waitingApprove, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveTx,
    query: { enabled: !!approveTx },
  });

  const { isLoading: waitingCreate } = useWaitForTransactionReceipt({
    hash: createTx,
    query: { enabled: !!createTx },
  });

  useEffect(() => {
    if (approveSuccess) refetchToken();
  }, [approveSuccess, refetchToken]);

  const parsedFee = (() => {
    try {
      return parseUnits(feeAmount || "0", TOKEN_DECIMALS);
    } catch {
      return BigInt(0);
    }
  })();
  const needsApproval = parsedFee > BigInt(0) && allowance !== undefined && allowance < parsedFee;
  const busy = approving || waitingApprove || creating || waitingCreate;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !resolutionDate) return;

    const timestamp = new Date(resolutionDate).getTime();
    if (Number.isNaN(timestamp)) return;
    const resolutionTime = BigInt(Math.floor(timestamp / 1000));

    if (needsApproval) {
      approve({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [HASH_PREDICTION_ADDRESS, maxUint256],
      });
      return;
    }

    create(
      {
        address: HASH_PREDICTION_ADDRESS,
        abi: HASH_PREDICTION_ABI,
        functionName: "createMarket",
        args: [question, resolutionTime, parsedFee],
      },
      {
        onSuccess: async (hash) => {
          if (!publicClient) return;
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          const log = receipt.logs.find((l) => {
            try {
              decodeEventLog({ abi: HASH_PREDICTION_ABI, eventName: "MarketCreated", topics: l.topics, data: l.data });
              return true;
            } catch {
              return false;
            }
          });
          if (log) {
            const decoded = decodeEventLog({ abi: HASH_PREDICTION_ABI, eventName: "MarketCreated", topics: log.topics, data: log.data });
            router.push(`/markets/${(decoded.args as { marketId: bigint }).marketId.toString()}`);
          } else {
            router.push("/");
          }
        },
      }
    );
  }

  if (!isConnected) return <p className="text-gray-500">Connect your wallet to create a market.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Create Market</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="mb-1 block text-sm text-gray-400">Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
            placeholder="Will ETH reach $10k by end of 2025?"
          />
        </div>
        <div>
          <label htmlFor="resolutionTime" className="mb-1 block text-sm text-gray-400">Resolution Time</label>
          <input
            id="resolutionTime"
            type="datetime-local"
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="feeAmount" className="mb-1 block text-sm text-gray-400">Creation Fee (mUSDC)</label>
          <input
            id="feeAmount"
            type="text"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none focus:border-gray-600"
            placeholder="0"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !question.trim() || !resolutionDate}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          {needsApproval
            ? busy ? "Approving..." : "Approve mUSDC"
            : busy ? "Creating..." : "Create Market"}
        </button>
        {(approveError || createError) && (
          <p className="text-xs text-red-400">{(approveError || createError)?.message?.split("\n")[0]}</p>
        )}
      </form>
    </div>
  );
}
