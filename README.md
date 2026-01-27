# HashPrediction

Binary prediction markets on HashKey Chain. Users create YES/NO markets, bet with mUSDC, and claim proportional payouts when markets resolve.

## Project Structure

```
HashPrediction/
  contract/       # Solidity smart contracts (Foundry)
  front-end/      # Next.js web application
```

## Deployed Contracts (HashKey Testnet, Chain ID 133)

| Contract | Address |
|----------|---------|
| HashPrediction | `0xC89bE9D4124E75869174ABd46b47De5a0d7e57E9` |
| MockERC20 (mUSDC, 6 decimals) | `0x9cefc16AD9dD2a4be819c616017F51d3A016C6ab` |
| Admin | `0xafb5963275f4E0F75AC472F7ABDfAeD06903d85C` |

- RPC: `https://testnet.hsk.xyz`
- Explorer: `https://testnet-explorer.hsk.xyz`

## Quick Start

### Smart Contracts

```bash
cd contract
forge install
forge build
forge test
```

Deploy to HashKey Testnet:

```bash
forge script script/Deploy.s.sol --rpc-url https://testnet.hsk.xyz --broadcast --legacy -vvvv
```

Seed sample markets:

```bash
forge script script/Seed.s.sol --rpc-url https://testnet.hsk.xyz --broadcast --legacy -vvvv
```

### Frontend

```bash
cd front-end
npm install
npm run dev
```

Open http://localhost:3000 and connect MetaMask with the HashKey testnet.

## How It Works

1. **Create Market** - Anyone posts a YES/NO question with a resolution time and optional fee
2. **Place Bets** - Users bet mUSDC on YES or NO before the resolution time
3. **Resolve / Cancel** - After resolution time, admin resolves with a winner or cancels
4. **Claim** - Winners claim their original bet plus a proportional share of the losing pool

## License

MIT
