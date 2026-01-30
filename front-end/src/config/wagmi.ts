// Source-controlled config — no .env needed
import { createConfig, http } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { hashkeyTestnet } from "./contracts";
import { APP_NAME, RPC_URL } from "./app";

export const config = createConfig({
  connectors: [
    injected(),
    coinbaseWallet({ appName: APP_NAME }),
  ],
  chains: [hashkeyTestnet],
  transports: {
    [hashkeyTestnet.id]: http(RPC_URL),
  },
  ssr: true,
});
