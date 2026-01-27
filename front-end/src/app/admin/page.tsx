"use client";

import { useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import {
  HASH_PREDICTION_ADDRESS,
  HASH_PREDICTION_ABI,
  MOCK_USDC_ADDRESS,
  ERC20_ABI,
  ADMIN_ADDRESS,
  TOKEN_DECIMALS,
} from "@/config/contracts";
import { useMarkets } from "@/hooks/useMarkets";

export default function AdminPage() {
  const { address } = useAccount();
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  if (!address) return <p className="text-gray-500">Connect your wallet.</p>;
  if (!isAdmin) return <p className="text-gray-500">Admin access only.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
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

function PauseSection() {
  const { data: config, refetch } = useReadContract({
    address: HASH_PREDICTION_ADDRESS,
    abi: HASH_PREDICTION_ABI,
    functionName: "getConfig",
  });

  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({
    hash: tx,
    query: { enabled: !!tx },
  });

  const paused = (config as Config | undefined)?.paused;
  const busy = isPending || isLoading;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-3 font-medium">Contract Status: {paused ? "Paused" : "Active"}</h2>
      <button
        onClick={() => {
          writeContract(
            {
              address: HASH_PREDICTION_ADDRESS,
              abi: HASH_PREDICTION_ABI,
              functionName: paused ? "unpause" : "pause",
            },
            { onSuccess: () => setTimeout(refetch, 2000) }
          );
        }}
        disabled={busy}
        className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
          paused ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
        }`}
      >
        {busy ? "..." : paused ? "Unpause" : "Pause"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}

function ConfigSection() {
  const [feeRecipient, setFeeRecipient] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });

  function handleUpdate() {
    let fee: bigint;
    try {
      fee = BigInt(maxFee || "0");
    } catch {
      return;
    }
    writeContract({
      address: HASH_PREDICTION_ADDRESS,
      abi: HASH_PREDICTION_ABI,
      functionName: "updateConfig",
      args: [feeRecipient as `0x${string}`, fee],
    });
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
      <h2 className="font-medium">Update Config</h2>
      <div>
        <label htmlFor="feeRecipient" className="mb-1 block text-xs text-gray-500">Fee recipient address</label>
        <input
          id="feeRecipient"
          placeholder="0x..."
          value={feeRecipient}
          onChange={(e) => setFeeRecipient(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none"
        />
      </div>
      <div>
        <label htmlFor="maxFeeBps" className="mb-1 block text-xs text-gray-500">Max fee (basis points, 100=1%)</label>
        <input
          id="maxFeeBps"
          placeholder="0"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none"
        />
      </div>
      <button
        onClick={handleUpdate}
        disabled={isPending || isLoading || !feeRecipient}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        {isPending || isLoading ? "Updating..." : "Update Config"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}

function MarketManagement() {
  const { data: markets } = useMarkets();
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });
  const busy = isPending || isLoading;

  const now = Math.floor(Date.now() / 1000);
  const actionable = markets.filter(
    (m) => m.state === 0 && Number(m.resolutionTime) <= now
  );

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h2 className="mb-3 font-medium">Resolve / Cancel Markets</h2>
      {actionable.length === 0 ? (
        <p className="text-sm text-gray-500">No markets past resolution time.</p>
      ) : (
        <div className="space-y-3">
          {actionable.map((m) => (
            <div key={m.id.toString()} className="flex items-center justify-between gap-2 rounded-lg border border-gray-800 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{m.question}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>YES: {formatUnits(m.yesPool, TOKEN_DECIMALS)}</span>
                  <span>NO: {formatUnits(m.noPool, TOKEN_DECIMALS)}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() =>
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "resolveMarket",
                      args: [m.id, 1],
                    })
                  }
                  disabled={busy}
                  className="rounded bg-green-700 px-3 py-1 text-xs hover:bg-green-600 disabled:opacity-50"
                >
                  YES
                </button>
                <button
                  onClick={() =>
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "resolveMarket",
                      args: [m.id, 2],
                    })
                  }
                  disabled={busy}
                  className="rounded bg-red-700 px-3 py-1 text-xs hover:bg-red-600 disabled:opacity-50"
                >
                  NO
                </button>
                <button
                  onClick={() =>
                    writeContract({
                      address: HASH_PREDICTION_ADDRESS,
                      abi: HASH_PREDICTION_ABI,
                      functionName: "cancelMarket",
                      args: [m.id],
                    })
                  }
                  disabled={busy}
                  className="rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}

function MintSection() {
  const [mintTo, setMintTo] = useState("");
  const [mintAmount, setMintAmount] = useState("1000");
  const { writeContract, data: tx, isPending, error } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash: tx, query: { enabled: !!tx } });

  function handleMint() {
    let parsed: bigint;
    try {
      parsed = parseUnits(mintAmount || "0", TOKEN_DECIMALS);
    } catch {
      return;
    }
    writeContract({
      address: MOCK_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "mint",
      args: [mintTo as `0x${string}`, parsed],
    });
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
      <h2 className="font-medium">Mint Test Tokens</h2>
      <div>
        <label htmlFor="mintTo" className="mb-1 block text-xs text-gray-500">Recipient address</label>
        <input
          id="mintTo"
          placeholder="0x..."
          value={mintTo}
          onChange={(e) => setMintTo(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none"
        />
      </div>
      <div>
        <label htmlFor="mintAmount" className="mb-1 block text-xs text-gray-500">Amount (mUSDC)</label>
        <input
          id="mintAmount"
          placeholder="1000"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none"
        />
      </div>
      <button
        onClick={handleMint}
        disabled={isPending || isLoading || !mintTo}
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
      >
        {isPending || isLoading ? "Minting..." : "Mint"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error.message?.split("\n")[0]}</p>}
    </div>
  );
}
