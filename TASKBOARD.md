# HashPrediction Task Board

## Project Overview
Binary prediction markets on HashKey Chain. Users create YES/NO markets, bet with mUSDC, and claim proportional payouts.

## Current Status
- ✅ Core smart contract deployed (HashKey Testnet)
- ✅ Next.js frontend with wallet connection
- ✅ Basic market CRUD, betting, resolution, claiming
- ✅ Portfolio page, admin page
- ✅ Unit tests, fuzz tests, integration tests

## Agent Roles
- **PM** — Researches ideas, prioritizes features, writes specs in this file
- **Contract Dev** — Implements Solidity changes per PM specs. **Rule: after every deploy, update `front-end/src/config/contracts.ts` with new addresses/ABIs.**
- **Frontend Dev** — Implements UI/UX changes per PM specs. **Rule: ALL config lives in source-controlled files (no .env). Already done for contracts.ts — maintain this pattern.**
- **Tester** — Runs tests, reviews code, reports bugs

---

## Sprint 1 — Social, Gamification & UX Foundation

### Task 1: Centralize All Frontend Config (No .env)
**Assigned to:** Frontend Dev
**Priority:** P0 (do first)

**Description:**
Audit the entire `front-end/` codebase and ensure zero reliance on `.env` files or `process.env`. All configuration — RPC URLs, contract addresses, chain IDs, feature flags — must live in source-controlled TypeScript config files under `front-end/src/config/`.

**What to do:**
1. Confirm no `process.env` references exist anywhere in `front-end/src/` (currently clean — keep it that way)
2. Create `front-end/src/config/app.ts` for app-level settings: app name, supported chain IDs, default RPC URL, explorer base URL, social links
3. Move the RPC URL from `wagmi.ts` (currently using viem default) into `app.ts` and import it explicitly: `http("https://testnet.hsk.xyz")` should reference the config
4. Add a `front-end/src/config/index.ts` barrel export for all config modules
5. Add a comment at the top of each config file: `// Source-controlled config — no .env needed`
6. Add `.env*` to `.gitignore` as a safety net

**Acceptance Criteria:**
- `grep -r "process.env" front-end/src/` returns nothing
- No `.env` files exist in `front-end/`
- `front-end/src/config/app.ts` exists with app name, RPC URL, explorer URL, chain ID
- `front-end/src/config/index.ts` barrel-exports all config
- App builds and runs with `npm run build && npm run dev`

---

### Task 2: Market Categories & Tags
**Assigned to:** Contract Dev + Frontend Dev
**Priority:** P1

**Description:**
Users can't browse by topic. Add category tagging so markets can be filtered by Crypto, Sports, Politics, Entertainment, Science, Other. This is what makes Polymarket browsable — categories are table stakes.

**Contract Dev — what to do:**
1. Add a `string category` field to the `Market` struct (after `question`)
2. Update `createMarket` to accept a `_category` parameter (string, max 32 bytes)
3. Include `category` in the `MarketCreated` event
4. Update `getMarket` return to include category
5. Update ABI in `front-end/src/config/contracts.ts` after deploy

**Frontend Dev — what to do:**
1. Add category selector (dropdown or pill buttons) to the Create Market page: `["Crypto", "Sports", "Politics", "Entertainment", "Science", "Other"]`
2. Store categories in `front-end/src/config/app.ts` as `MARKET_CATEGORIES`
3. Add category filter pills to the home page (alongside existing Active/Resolved/Cancelled filters)
4. Show category badge on `MarketCard` component
5. Pass category string to `createMarket` contract call

**Acceptance Criteria:**
- Markets can be created with a category
- Home page shows category filter pills; clicking one filters the grid
- MarketCard displays a small colored badge for the category
- Existing markets without a category display as "Other"

---

### Task 3: Leaderboard Page
**Assigned to:** Frontend Dev
**Priority:** P1

**Description:**
Leaderboards drive competition and retention. Polymarket's top traders page is one of their stickiest features. Build an on-chain leaderboard by indexing events.

**What to do:**
1. Create `/leaderboard` page at `front-end/src/app/leaderboard/page.tsx`
2. Add "Leaderboard" link to Navbar between "Portfolio" and "Admin"
3. Read all `BetPlaced` and `WinningsClaimed` events from the contract using `viem`'s `getContractEvents` / `getLogs`
4. Compute per-address stats: total bets placed (count), total volume wagered, total winnings claimed, net P&L (winnings minus amount wagered on resolved markets), win rate (markets won / markets participated in that resolved)
5. Display a table sorted by net P&L with columns: Rank, Address (truncated `0x1234...abcd`), Bets, Volume, Net P&L, Win Rate
6. Add time filter: All Time, Last 7 Days, Last 30 Days (filter events by block timestamp)
7. Highlight the connected wallet's row if present

**Acceptance Criteria:**
- `/leaderboard` route works and is linked from Navbar
- Table shows at least: rank, address, # bets, volume, net P&L, win rate
- Connected wallet row is highlighted with amber border
- Time filter toggles work (All Time / 7d / 30d)
- Gracefully shows "No activity yet" when no events exist

---

### Task 4: Market Detail Page — Social Proof & Activity Feed
**Assigned to:** Frontend Dev
**Priority:** P1

**Description:**
The market detail page (`/markets/[id]`) needs social proof. Show recent bets as a live activity feed. Polymarket and Azuro both show recent trades — it builds FOMO and trust.

**What to do:**
1. In the market detail page, add an "Activity" section below the bet form
2. Query `BetPlaced` events filtered by `marketId` using `getLogs` with the `BetPlaced` event topic
3. Display each bet as a row: `0x1234...abcd bet 100 mUSDC on YES — 2 min ago`
4. Show the 20 most recent bets, sorted newest first
5. Use relative timestamps ("2 min ago", "1 hour ago")
6. Color-code: green text for YES bets, red text for NO bets
7. Auto-refresh every 15 seconds using `useEffect` + `setInterval` or React Query `refetchInterval`

**Acceptance Criteria:**
- Market detail page shows activity feed with recent bets
- Each entry shows: truncated address, amount, outcome (YES/NO), relative time
- YES bets in green, NO bets in red
- Feed auto-refreshes every 15 seconds
- Empty state: "No bets yet — be the first!"

---

### Task 5: User Profile Stats on Portfolio Page
**Assigned to:** Frontend Dev
**Priority:** P2

**Description:**
Gamify the portfolio page with performance stats and streaks. Users should feel rewarded for participation.

**What to do:**
1. Add a stats section at the top of the Portfolio page (above the existing summary cards)
2. Compute from existing portfolio data + events:
   - **Win Rate**: markets won / total resolved markets participated in (show as percentage + circular progress ring)
   - **Best Win**: largest single payout (show market question + amount)
   - **Current Streak**: consecutive correct predictions (wins in a row on resolved markets, ordered by resolution time)
   - **Total Markets**: count of unique markets participated in
3. Display as a horizontal row of stat cards with icons
4. Show a motivational badge based on win rate: 🐣 Beginner (<30%), 🎯 Sharp (30-60%), 🔥 On Fire (60-80%), 👑 Legend (80%+)

**Acceptance Criteria:**
- Portfolio page shows win rate (%), best win, current streak, total markets
- Badge displays next to username/address based on win rate tier
- Stats are computed from on-chain data (events + portfolio entries)
- Works correctly with 0 resolved markets (shows "No data yet")

---

### Task 6: Market Creation Fee Incentive — Creator Revenue Share
**Assigned to:** Contract Dev
**Priority:** P2

**Description:**
Incentivize market creation by giving creators a small cut of the winning pool. This is similar to how Azuro rewards liquidity providers. Currently the creation fee goes to `feeRecipient` but creators get nothing from volume.

**Contract Dev — what to do:**
1. Add a `uint256 creatorFeePercentage` to `Config` (basis points, e.g., 100 = 1%, max 200 = 2%)
2. Add `creatorFeePercentage` to `ConfigSnapshot` (snapshotted at market creation)
3. In `claimWinnings`, when `state == Resolved`, calculate `creatorFee = totalPool * creatorFeePercentage / 10000` before distributing to winners. Deduct from the losing pool before proportional split.
4. Transfer `creatorFee` to `market.creator` during the first claim on that market (use a `bool creatorFeePaid` flag in Market struct)
5. Add `updateConfig` support for the new field
6. Update ABI in `front-end/src/config/contracts.ts` after deploy

**Acceptance Criteria:**
- Creator receives a percentage of the total pool upon market resolution (paid during first claim)
- Creator fee is configurable by admin (0-2% range enforced)
- Fee is deducted from losing pool before winner distribution
- Existing tests updated; new tests for creator fee edge cases
- `contracts.ts` updated with new ABI

---

### Task 7: Improved Market Card UX — Implied Probability & Share Button
**Assigned to:** Frontend Dev
**Priority:** P2

**Description:**
Show implied probability (like Polymarket's YES/NO percentages) and let users share markets. These are the two most requested features on prediction market forums.

**What to do:**
1. **Implied Probability**: On `MarketCard` and market detail page, calculate and display YES/NO probability as percentages: `YES% = yesPool / (yesPool + noPool) * 100`. Show as large text (e.g., "72% YES"). When both pools are 0, show "50% / 50%"
2. **Share Button**: Add a share icon button on the market detail page. On click, copy a shareable URL to clipboard (`window.location.href`). Show a "Link copied!" toast for 2 seconds.
3. **Potential Return Display**: In the BetForm, below the amount input, show "Potential return: X mUSDC" calculated as: `amount + (amount * opposingPool / (samePool + amount))`. Update live as the user types.

**Acceptance Criteria:**
- MarketCard shows YES/NO probability percentages (e.g., "72% YES · 28% NO")
- Market detail page shows probability prominently
- Share button copies URL to clipboard with confirmation toast
- BetForm shows potential return that updates as user types amount
- Potential return shows "—" when amount is empty or 0

---

## Completed
_Moved here after tester approval_

## Bug Reports
_Tester adds bugs here_
