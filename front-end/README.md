# HashPrediction Frontend

Next.js web interface for the HashPrediction binary prediction market contract on HashKey Chain.

## Tech Stack

- Next.js 14 (App Router), TypeScript
- Tailwind CSS
- wagmi v2 + viem v2 (contract interaction)
- RainbowKit (wallet connection)
- TanStack React Query (wagmi peer dependency)

## Setup

```bash
npm install
cp .env.local.example .env.local  # or edit .env.local directly
npm run dev
```

Open http://localhost:3000.

## Environment Variables

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # From cloud.walletconnect.com
NEXT_PUBLIC_HASH_PREDICTION_ADDRESS=    # HashPrediction contract address
NEXT_PUBLIC_MOCK_USDC_ADDRESS=          # mUSDC token address
NEXT_PUBLIC_ADMIN_ADDRESS=              # Admin wallet address
```

All addresses have defaults pointing to the HashKey Testnet deployment.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Market list with filter tabs (All / Active / Resolved / Cancelled) |
| `/markets/[id]` | Market detail: pool bar, bet form, position display, claim button |
| `/create` | Create a new market (question, resolution time, optional fee) |
| `/admin` | Admin panel: pause/unpause, update config, resolve/cancel markets, mint test tokens |

## Project Structure

```
src/
  app/
    layout.tsx                # Root layout with Providers + Navbar
    page.tsx                  # Home: market list
    markets/[id]/page.tsx     # Market detail
    create/page.tsx           # Create market form
    admin/page.tsx            # Admin panel
    globals.css
  config/
    contracts.ts              # ABIs, addresses, chain definition
    wagmi.ts                  # wagmi + RainbowKit config
  components/
    Providers.tsx             # WagmiProvider + RainbowKit + QueryClient
    Navbar.tsx                # Navigation + ConnectButton
    MarketCard.tsx            # Market summary card
    MarketStatus.tsx          # Active/Resolved/Cancelled badge
    CountdownTimer.tsx        # Countdown to resolution
    PoolBar.tsx               # YES vs NO pool visualization
    BetForm.tsx               # Bet with approve flow
    PositionDisplay.tsx       # User position + claim
  hooks/
    useMarkets.ts             # Fetch all markets via multicall
    useMarket.ts              # Single market read
    useUserPosition.ts        # Position + payout
    useTokenBalance.ts        # mUSDC balance + allowance
```

## Key Details

- **Approve flow**: Checks allowance before `placeBet`/`createMarket`. If insufficient, approves `MaxUint256` first.
- **Multicall**: Uses `useReadContracts` to batch all `getMarket(1..N)` calls in one RPC request.
- **Token formatting**: All mUSDC amounts use `parseUnits`/`formatUnits` with 6 decimals.
- **Polling**: Market data refreshes every 15 seconds.
- **Chain enforcement**: Only HashKey Testnet is configured in RainbowKit.
