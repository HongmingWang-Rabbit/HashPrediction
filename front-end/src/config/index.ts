// Source-controlled config — no .env needed
// Barrel export for all config modules

export * from "./app";
export * from "./contracts";
export { config as wagmiConfig } from "./wagmi";
