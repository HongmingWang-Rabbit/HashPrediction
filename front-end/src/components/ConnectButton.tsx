"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isConnected && address) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 transition-colors"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-700/50 bg-slate-900 p-1 shadow-xl z-50">
            <button
              onClick={() => { disconnect(); setOpen(false); }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
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
