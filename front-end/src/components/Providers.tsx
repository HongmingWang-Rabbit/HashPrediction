"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/config/wagmi";
import { RPC_URL, EXPLORER_URL } from "@/config/app";
import { hashkeyTestnet } from "@/config/contracts";
import "@rainbow-me/rainbowkit/styles.css";

/**
 * On connect, request wallet to add/switch to HashKey Testnet with our RPC.
 * This overrides broken built-in RPCs (e.g. OKX wallet).
 */
function ChainEnforcer() {
  const { connector, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !connector) return;
    (async () => {
      try {
        const provider = await connector.getProvider() as { request?: (args: { method: string; params: unknown[] }) => Promise<unknown> };
        if (!provider?.request) return;
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${hashkeyTestnet.id.toString(16)}`,
            chainName: hashkeyTestnet.name,
            nativeCurrency: hashkeyTestnet.nativeCurrency,
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [EXPLORER_URL],
          }],
        });
      } catch {
        // Wallet may reject if chain already added — that's fine
      }
    })();
  }, [isConnected, connector]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#9f6ffd" })}>
          <ChainEnforcer />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
