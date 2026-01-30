"use client";

import { useState, useRef, useEffect } from "react";
import { parseUnits, formatUnits } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Id } from "react-toastify";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  ADMIN_ADDRESS,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useMarkets } from "@/hooks/useMarkets";
import { txToast } from "@/lib/toast";

export default function AdminPage() {
  const { address } = useAccount();
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  if (!address) {
    return (
      <div className="glass-card mx-auto max-w-lg p-12 text-center">
        <p className="text-[#70707b]">Connect your wallet.</p>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="glass-card mx-auto max-w-lg p-12 text-center">
        <p className="text-[#70707b]">Admin access only.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-[#70707b] mt-1">Manage contracts and markets</p>
      </div>
      <PauseSection />
      <ConfigSection />
      <MarketManagement />
      <MintSection />
    </div>
  );
}

type Config = {
  admin: `0x${string}`;
  feeRecipient: `0x${string}`;
  maxFeePercentage: bigint;
  paused: boolean;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-[#70707b] uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function PauseSection() {
  const { data: config, refetch } = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getConfig",
    query: { staleTime: 10_000, refetchOnWindowFocus: true },
  });

  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: tx,
    query: { enabled: !!tx },
  });

  const paused = (config as Config | undefined)?.paused;
  const busy = isPending || isLoading;
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
    if (isSuccess && toastId.current !== null) {
      txToast.success(toastId.current, paused ? "Contract unpaused ✅" : "Contract paused ⏸️");
      toastId.current = null;
      setTimeout(refetch, 2000);
    }
  }, [isSuccess, paused, refetch]);

  useEffect(() => {
    if (error && toastId.current !== null) {
      txToast.error(toastId.current, error.message?.includes("User rejected") ? "Transaction rejected" : error.message?.split("\n")[0] ?? "Failed");
      toastId.current = null;
    }
  }, [error]);

  return (
    <SectionCard title="Contract Status">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-block h-3 w-3 rounded-full ${paused ? "bg-[#f8495e]" : "bg-[#19bf86]"}`} />
          <span className="text-white font-medium">{paused ? "Paused" : "Active"}</span>
        </div>
        <button
          onClick={() => {
            toastId.current = txToast.pending(paused ? "Unpausing contract..." : "Pausing contract...");
            writeContract({
              address: HASH_PREDICTION_ADDRESS,
              abi: HASH_PREDICTION_ABI,
              functionName: paused ? "unpause" : "pause",
            });
          }}
          disabled={busy}
          className={`rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50 transition-all ${
            paused ? "bg-[#19bf86] hover:bg-[#19bf86] text-white" : "bg-[#f8495e] hover:bg-[#f8495e] text-white"
          }`}
        >
          {busy ? "..." : paused ? "Unpause" : "Pause"}
        </button>
      </div>
    </SectionCard>
  );
}

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function ConfigSection() {
  const [feeRecipient, setFeeRecipient] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  const toastId = useRef<Id | null>(null);

  const isValidAddress = ADDRESS_RE.test(feeRecipient);

  useEffect(() => {
    if (isSuccess && toastId.current !== null) {
      txToast.success(toastId.current, "Config updated ✅");
      toastId.current = null;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && toastId.current !== null) {
      txToast.error(toastId.current, error.message?.includes("User rejected") ? "Transaction rejected" : error.message?.split("\n")[0] ?? "Update failed");
      toastId.current = null;
    }
  }, [error]);

  function handleUpdate() {
    if (!isValidAddress) return;
    let fee: bigint;
    try {
      fee = BigInt(maxFee || "0");
    } catch {
      return;
    }
    toastId.current = txToast.pending("Updating config...");
    writeContract({
      address: HASH_PREDICTION_ADDRESS,
      abi: HASH_PREDICTION_ABI,
      functionName: "updateConfig",
      args: [feeRecipient as `0x${string}`, fee, 100n],
    });
  }

  return (
    <SectionCard title="Update Config">
      <div className="space-y-4">
        <div>
          <label htmlFor="feeRecipient" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Fee recipient address</label>
          <input
            id="feeRecipient"
            placeholder="0x..."
            value={feeRecipient}
            onChange={(e) => setFeeRecipient(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="maxFeeBps" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Max fee (basis points, 100=1%)</label>
          <input
            id="maxFeeBps"
            placeholder="0"
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={isPending || isLoading || !isValidAddress}
          className="rounded-xl gradient-cta px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isPending || isLoading ? "Updating..." : "Update Config"}
        </button>
      </div>
      {feeRecipient && !isValidAddress && (
        <p className="mt-3 text-xs text-[#9f6ffd]">Enter a valid Ethereum address (0x + 40 hex characters)</p>
      )}
    </SectionCard>
  );
}

function MarketManagement() {
  const { data: markets } = useMarkets();
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  const busy = isPending || isLoading;
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
    if (isSuccess && toastId.current !== null) {
      txToast.success(toastId.current, "Market action completed ✅");
      toastId.current = null;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && toastId.current !== null) {
      txToast.error(toastId.current, error.message?.includes("User rejected") ? "Transaction rejected" : error.message?.split("\n")[0] ?? "Action failed");
      toastId.current = null;
    }
  }, [error]);

  const now = Math.floor(Date.now() / 1000);
  const actionable = markets.filter(
    (m) => m.state === 0 && Number(m.resolutionTime) <= now
  );

  return (
    <SectionCard title="Resolve / Cancel Markets">
      {actionable.length === 0 ? (
        <p className="text-sm text-[#f4f4f5]0">No markets past resolution time.</p>
      ) : (
        <div className="space-y-3">
          {actionable.map((m) => (
            <div key={m.id.toString()} className="flex items-center justify-between gap-3 rounded-xl border border-[#3f3f46]/30 bg-[#17181e]/30 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm text-white font-medium">{m.question}</p>
                <div className="flex gap-3 text-xs text-[#f4f4f5]0 mt-1">
                  <span>YES: {formatUnits(m.yesPool, TOKEN_DECIMALS)}</span>
                  <span>NO: {formatUnits(m.noPool, TOKEN_DECIMALS)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row shrink-0 gap-2">
                <button
                  onClick={() => {
                    toastId.current = txToast.pending("Resolving market as YES...");
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "resolveMarket",
                      args: [m.id, 1],
                    });
                  }}
                  disabled={busy}
                  className="rounded-lg bg-[#19bf86] px-3 py-2 text-xs font-medium text-white hover:bg-[#19bf86] disabled:opacity-50 transition-all"
                >
                  YES
                </button>
                <button
                  onClick={() => {
                    toastId.current = txToast.pending("Resolving market as NO...");
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "resolveMarket",
                      args: [m.id, 2],
                    });
                  }}
                  disabled={busy}
                  className="rounded-lg bg-[#f8495e] px-3 py-2 text-xs font-medium text-white hover:bg-[#f8495e] disabled:opacity-50 transition-all"
                >
                  NO
                </button>
                <button
                  onClick={() => {
                    toastId.current = txToast.pending("Cancelling market...");
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "cancelMarket",
                      args: [m.id],
                    });
                  }}
                  disabled={busy}
                  className="rounded-lg bg-[#3f3f46] px-3 py-2 text-xs font-medium text-white hover:bg-[#3f3f46] disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function MintSection() {
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("1000");
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
    if (isSuccess && toastId.current !== null) {
      txToast.success(toastId.current, "Tokens minted ✅");
      toastId.current = null;
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error && toastId.current !== null) {
      txToast.error(toastId.current, error.message?.includes("User rejected") ? "Transaction rejected" : error.message?.split("\n")[0] ?? "Mint failed");
      toastId.current = null;
    }
  }, [error]);

  function handleMint() {
    let parsed: bigint;
    try {
      parsed = parseUnits(mintAmount || "0", TOKEN_DECIMALS);
    } catch {
      return;
    }
    toastId.current = txToast.pending("Minting tokens...");
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [mintTo as `0x${string}`, parsed],
    });
  }

  return (
    <SectionCard title="Mint Test Tokens">
      <div className="space-y-4">
        <div>
          <label htmlFor="mintTo" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Recipient address</label>
          <input
            id="mintTo"
            placeholder="0x..."
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="mintAmount" className="mb-2 block text-sm font-medium text-[#d1d1d6]">Amount (mUSDC)</label>
          <input
            id="mintAmount"
            placeholder="1000"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          onClick={handleMint}
          disabled={isPending || isLoading || !mintTo}
          className="rounded-xl gradient-cta px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {isPending || isLoading ? "Minting..." : "Mint"}
        </button>
      </div>
    </SectionCard>
  );
}
