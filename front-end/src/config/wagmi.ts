// Source-controlled config — no .env needed
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hashkeyTestnet } from "./contracts";
import { APP_NAME, RPC_URL } from "./app";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: APP_NAME,
  projectId: "04f834a0e4c2e5b3f0b1d8a9c7e6f512", // WalletConnect project ID
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http(RPC_URL),
  },
  batch: { multicall: { wait: 50 } },
  ssr: true,
});
