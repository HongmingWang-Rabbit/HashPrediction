"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MOCK_USDC_ADDRESS, ERC20_ABI, TOKEN_DECIMALS } from "@/config/contracts";
import { txToast } from "@/lib/toast";
import { useEffect, useRef } from "react";
import { formatUnits } from "viem";

const MINT_AMOUNT = BigInt(1000) * BigInt(10 ** TOKEN_DECIMALS); // 1000 mUSDC

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const toastId = useRef<ReturnType<typeof txToast.pending> | null>(null);

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: MOCK_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function handleClaim() {
    if (!address) return;
    toastId.current = txToast.pending("Claiming tokens...");
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [address, MINT_AMOUNT],
    }, {
      onError: () => {
        if (toastId.current) txToast.error(toastId.current, "Transaction rejected");
        toastId.current = null;
      },
    });
  }

  useEffect(() => {
    if (isSuccess && toastId.current) {
      txToast.success(toastId.current, "1,000 mUSDC claimed! 🎉");
      toastId.current = null;
      refetchBalance();
      reset();
    }
    if (isError && toastId.current) {
      txToast.error(toastId.current, "Transaction failed");
      toastId.current = null;
      reset();
    }
  }, [isSuccess, isError, refetchBalance, reset]);

  const formattedBalance = balance !== undefined
    ? Number(formatUnits(balance as bigint, TOKEN_DECIMALS)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "—";

  const isBusy = isPending || isConfirming;

  return (
    <main className="mx-auto max-w-lg px-4 py-16 animate-fade-in-up">
      <div className="glass-card p-8 text-center space-y-6">
        <div className="text-4xl">💧</div>
        <h1 className="text-2xl font-bold text-white">mUSDC Faucet</h1>
        <p className="text-[#a1a1aa] text-sm">
          Claim test mUSDC tokens to use on HashPrediction markets.
        </p>

        {isConnected ? (
          <>
            <div className="rounded-xl bg-[#17181e]/50 border border-[#3f3f46] p-4">
              <p className="text-xs text-[#70707b] uppercase tracking-wider mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-white">{formattedBalance} <span className="text-sm text-[#a1a1aa]">mUSDC</span></p>
            </div>

            <button
              onClick={handleClaim}
              disabled={isBusy}
              className="w-full rounded-xl gradient-primary py-3 px-6 text-sm font-semibold text-white glow-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? "Claiming..." : "Claim 1,000 mUSDC"}
            </button>
          </>
        ) : (
          <div className="rounded-xl bg-[#17181e]/50 border border-[#3f3f46] p-4">
            <p className="text-[#a1a1aa] text-sm">Connect your wallet to claim tokens</p>
          </div>
        )}

        <p className="text-xs text-[#70707b]">
          ⚠️ Testnet tokens only — no real value
        </p>
      </div>
    </main>
  );
}
