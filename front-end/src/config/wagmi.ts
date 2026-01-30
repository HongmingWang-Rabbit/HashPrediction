import { createConfig, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { hashkeyTestnet } from "./contracts";

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: "HashPrediction" }),
  ],
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http(),
  },
  ssr: true,
});
