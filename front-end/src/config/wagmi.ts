// Source-controlled config — no .env needed
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hashkeyTestnet } from "./contracts";
import { APP_NAME, RPC_URL } from "./app";
import { http } from "wagmi";

// Use proxy in browser to avoid CORS issues with the RPC endpoint.
// Server-side (SSR) calls go directly to the RPC.
const rpcUrl = typeof window !== "undefined" ? "/api/rpc" : RPC_URL;

export const config = getDefaultConfig({
  appName: APP_NAME,
  // Get your own project ID at https://cloud.reown.com
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder",
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http(rpcUrl),
  },
  batch: { multicall: { wait: 50 } },
  ssr: true,
});
