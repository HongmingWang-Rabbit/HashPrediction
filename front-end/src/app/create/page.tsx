"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { parseUnits, decodeEventLog } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import { Id } from "react-toastify";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { txToast } from "@/lib/toast";

const STEPS = ["Details", "Fee", "Review"];

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { allowance, refetch: refetchToken } = useTokenBalance();

  const [question, setQuestion] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [step, setStep] = useState(0);
  const approveToastId = useRef<Id | null>(null);
  const createToastId = useRef<Id | null>(null);

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
    if (approveSuccess) {
      refetchToken();
      if (approveToastId.current !== null) {
        txToast.success(approveToastId.current, "Approval successful ✅");
        approveToastId.current = null;
      }
    }
  }, [approveSuccess, refetchToken]);

  useEffect(() => {
    if (approveError) {
      const msg = approveError.message?.includes("User rejected")
        ? "Approval rejected by wallet"
        : approveError.message?.split("\n")[0] ?? "Approval failed";
      if (approveToastId.current !== null) {
        txToast.error(approveToastId.current, msg);
        approveToastId.current = null;
      }
    }
  }, [approveError]);

  useEffect(() => {
    if (createError) {
      const msg = createError.message?.includes("User rejected")
        ? "Transaction rejected by wallet"
        : createError.message?.split("\n")[0] ?? "Market creation failed";
      if (createToastId.current !== null) {
        txToast.error(createToastId.current, msg);
        createToastId.current = null;
      }
    }
  }, [createError]);

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
      approveToastId.current = txToast.pending("Approving mUSDC...");
      approve({
        address: MOCK_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [HASH_PREDICTION_ADDRESS, parsedFee],
      });
      return;
    }

    createToastId.current = txToast.pending("Creating market...");
    create(
      {
        address: HASH_PREDICTION_ADDRESS,
        abi: HASH_PREDICTION_ABI,
        functionName: "createMarket",
        args: [question, resolutionTime, parsedFee, "0x63727970746f0000000000000000000000000000000000000000000000000000" as `0x${string}`],
      },
      {
        onSuccess: async (hash) => {
          if (!publicClient) return;
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            if (createToastId.current !== null) {
              txToast.success(createToastId.current, "Market created! 🎉");
              createToastId.current = null;
            }
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
          } catch {
            if (createToastId.current !== null) {
              txToast.error(createToastId.current, "Market creation failed");
              createToastId.current = null;
            }
          }
        },
      }
    );
  }

  if (!isConnected) {
    return (
      <div className="glass-card mx-auto max-w-lg p-12 text-center">
        <p className="text-[#70707b]">Connect your wallet to create a market.</p>
      </div>
    );
  }

  const canAdvance = step === 0 ? question.trim() && resolutionDate : true;

  return (
    <motion.div
      className="mx-auto max-w-lg"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="mb-2 text-2xl font-bold text-white">Create Market</h1>
      <p className="mb-8 text-[#70707b]">Set up a new prediction market</p>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i === step
                  ? "bg-[#9f6ffd] text-black"
                  : i < step
                  ? "bg-[#9f6ffd]/20 text-[#9f6ffd] cursor-pointer"
                  : "bg-[#17181e] text-[#f4f4f5]0"
              }`}
            >
              {i + 1}
            </button>
            <span className={`text-[10px] sm:text-xs ${i === step ? "text-white" : "text-[#f4f4f5]0"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="mx-1 sm:mx-2 h-px w-4 sm:w-8 bg-[#3f3f46]" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <>
            <div>
              <label htmlFor="question" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Question</label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Will ETH reach $10k by end of 2025?"
              />
            </div>
            <div>
              <label htmlFor="resolutionTime" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Resolution Time</label>
              <input
                id="resolutionTime"
                type="datetime-local"
                value={resolutionDate}
                onChange={(e) => setResolutionDate(e.target.value)}
                className="w-full rounded-xl border border-[#3f3f46]/50 bg-[#17181e]/50 px-4 py-3 text-sm text-white outline-none focus:border-[#9f6ffd]/50 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!canAdvance}
              className="w-full rounded-xl gradient-cta py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label htmlFor="feeAmount" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Creation Fee (mUSDC)</label>
              <input
                id="feeAmount"
                type="text"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="input-field"
                placeholder="0"
              />
              <p className="mt-2 text-xs text-[#f4f4f5]0">Fee paid to the protocol for creating this market</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 rounded-xl border border-[#3f3f46]/50 py-3 text-sm font-medium text-[#d1d1d6] hover:bg-[#17181e]/50 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl gradient-cta py-3 text-sm font-semibold text-white hover:opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Preview card */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[#70707b] uppercase tracking-wider">Preview</h3>
              <p className="text-white font-medium">{question}</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#70707b]">Resolution</span>
                <span className="text-[#d1d1d6]">{resolutionDate ? new Date(resolutionDate).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#70707b]">Fee</span>
                <span className="text-[#d1d1d6]">{feeAmount} mUSDC</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-[#3f3f46]/50 py-3 text-sm font-medium text-[#d1d1d6] hover:bg-[#17181e]/50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={busy || !question.trim() || !resolutionDate}
                className="flex-1 rounded-xl gradient-primary py-3 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {needsApproval
                  ? busy ? "Approving..." : "Approve mUSDC"
                  : busy ? "Creating..." : "Create Market"}
              </button>
            </div>
          </>
        )}

      </form>
    </motion.div>
  );
}
