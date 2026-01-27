# HashPrediction

Binary Prediction Markets on HashKey Chain.

Forked from [evm-simple-prediction-market-contract](https://github.com/SivaramPg/evm-simple-prediction-market-contract).

## Features

- Pot-based binary prediction markets (YES/NO outcomes)
- Admin-controlled market resolution
- ERC20 stablecoin betting
- Proportional payout distribution
- Market cancellation with full refunds
- Batch claiming for multiple markets
- Emergency pause functionality

## HashKey Chain

| Property | Mainnet | Testnet |
|----------|---------|---------|
| Chain ID | 177 | 133 |
| RPC | https://mainnet.hsk.xyz | https://hashkeychain-testnet.alt.technology |
| Explorer | https://hashkey.blockscout.com | https://testnet-explorer.hsk.xyz |
| Native Token | HSK | HSK |
| Gas | ~0.1 Gwei | ~0.1 Gwei |
| Block Time | 2 seconds | 2 seconds |

## Quick Start

```bash
# Install dependencies
forge install

# Build
forge build

# Run tests
forge test

# Run tests with verbose output
forge test -vvv

# Run tests with gas report
forge test --gas-report
```

## Deployment

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy to HashKey Testnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://hashkeychain-testnet.alt.technology \
  --broadcast \
  --legacy \
  -vvvv
```

### 3. Deploy to HashKey Mainnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url https://mainnet.hsk.xyz \
  --broadcast \
  --legacy \
  -vvvv
```

### 4. Verify Contract on Blockscout

```bash
forge verify-contract <CONTRACT_ADDRESS> HashPrediction \
  --chain-id 177 \
  --verifier blockscout \
  --verifier-url https://hashkey.blockscout.com/api
```

## Contract Architecture

```
src/
  HashPrediction.sol      # Main prediction market contract
  interfaces/
    IERC20.sol            # ERC20 interface
  mocks/
    MockERC20.sol         # Mock token for testing
```

## Market Lifecycle

1. **Create Market**: Anyone can create a prediction market with a question and resolution time
2. **Place Bets**: Users bet on YES or NO outcomes using stablecoin
3. **Resolution Time**: Betting closes at the resolution time
4. **Resolve/Cancel**: Admin resolves the market with the winning outcome or cancels it
5. **Claim Winnings**: Winners claim their proportional share of the losing pool

## Payout Calculation

Winners receive:
- Their original bet amount
- Plus their proportional share of the losing pool

```
payout = userBet + (userBet / winningPool) * losingPool
```

## Scripts

### Create a Market

```bash
MARKET_ADDRESS=0x... QUESTION="Will BTC hit 100k?" RESOLUTION_DAYS=7 \
  forge script script/CreateMarket.s.sol --rpc-url <RPC_URL> --broadcast --legacy
```

### Place a Bet

```bash
ACTION=bet MARKET_ADDRESS=0x... MARKET_ID=1 IS_YES=true AMOUNT=1000000 \
  forge script script/Interact.s.sol --rpc-url <RPC_URL> --broadcast --legacy
```

### Resolve a Market

```bash
ACTION=resolve MARKET_ADDRESS=0x... MARKET_ID=1 YES_WINS=true \
  forge script script/Interact.s.sol --rpc-url <RPC_URL> --broadcast --legacy
```

### Claim Winnings

```bash
ACTION=claim MARKET_ADDRESS=0x... MARKET_ID=1 \
  forge script script/Interact.s.sol --rpc-url <RPC_URL> --broadcast --legacy
```

## Testing

The test suite includes:
- **Unit tests**: Individual function testing
- **Integration tests**: Full market lifecycle testing
- **Fuzz tests**: Randomized input testing for payout calculations

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/unit/Betting.t.sol

# Run tests with coverage
forge coverage
```

## Security Considerations

- This contract is unaudited and for educational purposes
- Admin has significant control (resolution, cancellation, pause)
- Markets require opposition (bets on both sides) to resolve
- Reentrancy protection via custom guard

## Resources

- **HashKey Docs**: https://docs.hashkeychain.net/
- **HashKey Bridge**: https://bridge.hsk.xyz/
- **HashKey Explorer**: https://hashkey.blockscout.com/
- **Foundry Book**: https://book.getfoundry.sh/

## License

MIT
