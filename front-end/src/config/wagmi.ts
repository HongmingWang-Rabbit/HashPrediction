import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hashkeyTestnet } from "./contracts";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!projectId && typeof window !== "undefined") {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not work.");
}

export const config = getDefaultConfig({
  appName: "HashPrediction",
  projectId: projectId || "demo",
  chains: [hashkeyTestnet],
  ssr: true,
});
