"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Find the injected connector (MetaMask, Rabby, etc.)
  const injected = connectors.find((c) => c.type === "injected");
  const fallback = connectors[0];
  const connector = injected ?? fallback;

  if (!connector) {
    return (
      <span className="rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-400">
        No wallet detected
      </span>
    );
  }

  return (
    <button
      onClick={() => connect({ connector })}
      disabled={isPending}
      className="rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90 disabled:opacity-50 transition-all"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
