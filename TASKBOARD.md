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
- **Contract Dev** — Implements Solidity changes per PM specs
- **Frontend Dev** — Implements UI/UX changes per PM specs
- **Tester** — Runs tests, reviews code, reports bugs

---

## Sprint 1 — "Stickiness & Social"

> **Goal:** Make users come back daily and tell their friends. Right now the app is functional but has zero retention hooks. Every competitor (Polymarket, Azuro, Myriad) beats us on engagement. This sprint adds the social/gamification layer that turns one-time visitors into regulars.

### Research Summary
- **Polymarket** dominates on liquidity + event diversity; weakness is zero gamification
- **Azuro** differentiates with LP yields (20-120% APY) and native token incentives
- **Myriad** uses daily streaks, quests, leaderboards, and point-based reputation
- **Rova** combines streak-based reputation with prediction markets
- **Key insight:** The winning playbook is **leaderboards + streaks + social sharing + payout multiplier visibility**. These are table-stakes for any new entrant.

---

### P0 — Must Have (High Impact, Ship First)

#### T1: On-Chain Leaderboard Tracking
- **Dev:** Contract
- **Description:** Add a new `UserStats` struct and mapping to track per-address stats on-chain: total bets placed, total won, total lost, total volume, current win streak, best win streak. Update stats in `claimWinnings` (increment wins/losses based on payout > 0). Add a view function `getUserStats(address) → UserStats`.
- **Acceptance Criteria:**
  - `UserStats` struct with fields: `totalBets`, `totalWins`, `totalLosses`, `totalVolume`, `currentStreak`, `bestStreak`
  - Stats updated atomically inside `claimWinnings` and `claimMultipleWinnings`
  - `getUserStats(address)` view function returns the struct
  - All existing tests still pass; new unit tests for stat tracking

#### T2: Leaderboard UI
- **Dev:** Frontend
- **Description:** Add a `/leaderboard` page. Read `UserStats` for known addresses (use event indexing — scan `BetPlaced` events to collect unique addresses, then batch-call `getUserStats`). Display a ranked table: rank, address (truncated), win rate, streak 🔥, total volume. Highlight the connected user's row. Add a "Leaderboard" link to the navbar.
- **Acceptance Criteria:**
  - `/leaderboard` route accessible from navbar
  - Table shows top 50 users sorted by wins (toggle: by volume, by streak)
  - Connected wallet row is highlighted with amber accent
  - Loading skeleton while fetching
  - Mobile responsive (horizontal scroll or card layout on small screens)

#### T3: Potential Payout Preview in BetForm
- **Dev:** Frontend
- **Description:** Before placing a bet, show the user their potential payout in real-time. Formula: `amount + (amount * losingPool) / (winningPool + amount)`. Display as "Potential Return: X.XX mUSDC (Y.Yx)" below the amount input. Update live as the user types or changes outcome.
- **Acceptance Criteria:**
  - Payout preview updates on every keystroke and outcome toggle
  - Shows both absolute return and multiplier (e.g., "150 mUSDC (1.5x)")
  - Shows "—" when amount is 0 or pools are empty
  - No extra RPC calls (uses already-fetched market data)

#### T4: Social Share Card
- **Dev:** Frontend
- **Description:** After placing a bet OR claiming winnings, show a "Share" button that generates a shareable card (canvas-rendered PNG or styled div) with: market question, user's position (YES/NO), amount, potential/actual payout. Include a "Copy Link" button that copies `{domain}/markets/{id}`. Also add Open Graph meta tags to market pages for link previews.
- **Acceptance Criteria:**
  - Share button appears in success toast after bet placement
  - Share button appears on claim success
  - "Copy Link" copies market URL to clipboard with visual confirmation
  - OG meta tags on `/markets/[id]` pages (title = question, description = pool sizes)
  - Works on mobile (native share API where available)

---

### P1 — Should Have (Medium Impact)

#### T5: Market Categories & Tags
- **Dev:** Contract + Frontend
- **Contract:** Add an optional `bytes32 category` field to the `Market` struct (set at creation). Define constants: `CRYPTO`, `SPORTS`, `POLITICS`, `ENTERTAINMENT`, `OTHER`. Zero means uncategorized.
- **Frontend:** Add a category selector on `/create`. On the home page, add category filter pills above the existing filter bar. Each category has an emoji icon (🪙 📊 ⚽ 🏛️ 🎬).
- **Acceptance Criteria:**
  - Contract: `createMarket` accepts optional `bytes32 _category` parameter
  - Contract: `Market` struct includes `category` field
  - Frontend: category selector on create page (dropdown or pills)
  - Frontend: category filter on home page, works alongside existing Active/Resolved/Cancelled filter
  - Default is "All" showing every market

#### T6: Market Comments / Activity Feed
- **Dev:** Frontend (off-chain)
- **Description:** Add a comments section below market details on `/markets/[id]`. Store comments in localStorage initially (v1 — no backend). Each comment: wallet address (truncated), text, timestamp. Show recent bets as activity feed items ("0xab...cd bet 100 mUSDC on YES") by parsing `BetPlaced` events.
- **Acceptance Criteria:**
  - Activity feed shows last 20 `BetPlaced` events for the market with relative timestamps
  - Comment input (requires connected wallet)
  - Comments stored per-market in localStorage
  - Clean, minimal design consistent with glass-card aesthetic

#### T7: "Claim All" Button on Portfolio
- **Dev:** Frontend
- **Description:** The contract already has `claimMultipleWinnings`. Add a "Claim All" button at the top of the Claimable tab that batches all claimable market IDs into a single transaction.
- **Acceptance Criteria:**
  - Button visible only when ≥2 claimable positions exist
  - Calls `claimMultipleWinnings` with all claimable market IDs
  - Shows total payout sum before confirming
  - Success refreshes portfolio; error shows toast

#### T8: Odds Display on Market Cards
- **Dev:** Frontend
- **Description:** On each `MarketCard` on the home page, show the implied probability as a percentage: YES% = yesPool / (yesPool + noPool) × 100. Display as a compact badge like "YES 72%" with color gradient (green→red based on probability).
- **Acceptance Criteria:**
  - Percentage shown on every market card with non-zero pools
  - Shows "50/50" when pools are equal or both zero
  - Color scales from emerald (high YES) to rose (high NO)
  - Tooltip or small text: "Implied probability based on pool ratio"

---

### P2 — Nice to Have (Lower Priority / Future Sprint Candidates)

#### T9: Daily Prediction Streak (Contract)
- **Dev:** Contract
- **Description:** Track daily engagement on-chain. Add `lastBetDay` (block.timestamp / 86400) and `dailyStreak` to `UserStats`. In `placeBet`, if today's day number > lastBetDay + 1, reset streak to 1; if equal to lastBetDay + 1, increment; if same day, no change. Emit `StreakUpdated(address, uint256 streak)`.
- **Acceptance Criteria:**
  - Streak increments on consecutive calendar days of betting
  - Streak resets if a day is missed
  - Multiple bets in one day don't double-count
  - Event emitted on streak change

#### T10: Streak Display & Badges (Frontend)
- **Dev:** Frontend
- **Description:** Show the user's current streak with a 🔥 icon in the navbar (next to wallet). On the portfolio page, show streak milestones as badges: 3-day, 7-day, 30-day, 100-day. Animate the fire icon on streak increment.
- **Acceptance Criteria:**
  - 🔥 streak counter in navbar (reads from `getUserStats`)
  - Badge display on portfolio page
  - Subtle pulse animation when streak is active
  - "Start your streak!" CTA when streak is 0

#### T11: Market Creator Incentive
- **Dev:** Contract
- **Description:** Give market creators 1% of the total pool as a reward (paid from losing pool at resolution). Add `creatorReward` to resolution logic: before distributing to winners, skim 1% to `market.creator`. Make the percentage configurable by admin.
- **Acceptance Criteria:**
  - Creator receives 1% (configurable, stored in `Config`) of total pool at resolution
  - Deducted before winner payouts are calculated
  - Zero reward if market is cancelled
  - New tests covering reward math and edge cases

#### T12: Responsive Mobile Polish
- **Dev:** Frontend
- **Description:** Audit all pages on mobile viewports (375px, 390px, 428px). Fix: truncated text in market cards, pool bar overflow, bet form button sizing, portfolio table horizontal scroll. Add bottom-safe-area padding for iOS.
- **Acceptance Criteria:**
  - All pages render without horizontal overflow on 375px viewport
  - Text truncation with ellipsis (no clipping)
  - Touch targets ≥ 44px
  - Bottom safe area padding on iOS Safari

---

## Iteration Queue
_After Sprint 1, candidates for Sprint 2:_
- Oracle integration (Chainlink/API3) for automated resolution
- ERC-1155 position tokens (tradeable bet positions)
- Referral system with on-chain tracking
- LP pool for protocol-owned liquidity
- Native token / points system
- Multi-outcome markets (beyond binary YES/NO)
- Time-weighted average price display
- Notifications (email/push via off-chain service)

## Completed
- [x] **[Frontend] Remove all process.env references** — Hardcoded contract addresses, RPC URLs, chain IDs directly in `src/config/contracts.ts`. No .env files needed. (Priority override from Hongming) — `cebd1fa`
- [x] **[Frontend] Fix missing ActivityFeed component** — Created stub `ActivityFeed.tsx` so build passes. Was referenced in market detail page but never created.

## Bug Reports

### BUG-001: ActivityFeed never displays events (Severity: Medium)
- **Where:** `src/components/ActivityFeed.tsx`
- **What:** The component fetches raw logs via `client.getLogs()` but never decodes them. The comment says _"Real implementation would decode each log based on event signature"_ — so `parsed` is always empty and the feed always shows "No activity yet."
- **Impact:** T6 acceptance criteria requires "Activity feed shows last 20 BetPlaced events" — this doesn't work at all. It's a stub, not a functional component.
- **Fix:** Decode logs using `decodeEventLog` with `HASH_PREDICTION_ABI`, filter for `BetPlaced` events for the given `marketId`, map to `Activity[]`.

### BUG-002: ActivityFeed fetches ALL contract logs (Severity: Low)
- **Where:** `src/components/ActivityFeed.tsx`, line ~55
- **What:** `getLogs()` uses `fromBlock: "earliest"` with no event filter topics. On a chain with many events this will be extremely slow or hit RPC limits. Should filter by event signature + indexed `marketId`.
- **Fix:** Add `event` ABI definition and `args: { marketId }` to scope the query.

---

### Test Results — Baseline (Pre-Sprint)

**Contract:** ✅ 108/108 tests pass (unit, fuzz, integration) — `forge test -vvv`
**Frontend:** ✅ `npm run build` succeeds (warnings only from MetaMask SDK / pino-pretty — harmless, from upstream deps)

### Completed Item Testing

| Item | Status | Notes |
|------|--------|-------|
| Remove all process.env references | ✅ PASS | `grep -r "process.env" src/` returns nothing. All config in `contracts.ts`. Clean. |
| Fix missing ActivityFeed component | 🐛 PARTIAL | Build passes (stub exists), but component is non-functional — see BUG-001, BUG-002. Acceptable as "build fix" but T6 is NOT done. |
