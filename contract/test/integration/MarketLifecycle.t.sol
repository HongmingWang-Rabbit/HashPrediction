// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";

/// @title MarketLifecycleTest
/// @notice Integration tests for complete market lifecycle
contract MarketLifecycleTest is BaseTest {
    // ============ Full Lifecycle Tests ============

    /// @notice TC-IT-001: Complete Market Flow (YES Wins)
    function test_FullLifecycle_YesWins() public {
        // 1. Create market
        uint256 marketId = createDefaultMarket();

        // 2. Users place bets
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(charlie, marketId, HashPrediction.Outcome.No, usdc(100));

        // Verify pools
        HashPrediction.Market memory m = market.getMarket(marketId);
        assertEq(m.yesPool, usdc(200));
        assertEq(m.noPool, usdc(100));

        // 3. Warp to resolution time
        warpToResolution(marketId);

        // 4. Resolve market
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // 5. Users claim winnings
        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);
        uint256 bobBalanceBefore = stablecoin.balanceOf(bob);
        uint256 charlieBalanceBefore = stablecoin.balanceOf(charlie);

        claimWinnings(alice, marketId);
        claimWinnings(bob, marketId);
        claimWinnings(charlie, marketId);

        // Creator reward: 1% of 300 = 3, deducted from NO pool (100→97)
        // Alice: 100 + (100/200)*97 = 148.5
        // Bob: 100 + (100/200)*97 = 148.5
        // Charlie: 0 (lost)
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + 148500000);
        assertEq(stablecoin.balanceOf(bob), bobBalanceBefore + 148500000);
        assertEq(stablecoin.balanceOf(charlie), charlieBalanceBefore);

        // Verify all claimed
        assertTrue(market.getUserPosition(marketId, alice).claimed);
        assertTrue(market.getUserPosition(marketId, bob).claimed);
        assertTrue(market.getUserPosition(marketId, charlie).claimed);
    }

    /// @notice TC-IT-002: Complete Market Flow (NO Wins)
    function test_FullLifecycle_NoWins() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(50));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));
        placeBet(charlie, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.No);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);
        uint256 bobBalanceBefore = stablecoin.balanceOf(bob);
        uint256 charlieBalanceBefore = stablecoin.balanceOf(charlie);

        claimWinnings(alice, marketId);
        claimWinnings(bob, marketId);
        claimWinnings(charlie, marketId);

        // Creator reward: 1% of 250 = 2.5, from YES pool (50→47.5)
        // Bob: 100 + (100/200)*47.5 = 123.75
        // Charlie: 100 + (100/200)*47.5 = 123.75
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore);
        assertEq(stablecoin.balanceOf(bob), bobBalanceBefore + 123750000);
        assertEq(stablecoin.balanceOf(charlie), charlieBalanceBefore + 123750000);
    }

    /// @notice TC-IT-003: Complete Market Flow (Cancelled)
    function test_FullLifecycle_Cancelled() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.Yes, usdc(50));
        // No opposition

        warpToResolution(marketId);

        // Try to resolve - should fail
        vm.prank(admin);
        vm.expectRevert(HashPrediction.NoOpposition.selector);
        market.resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // Cancel instead
        cancelMarket(marketId);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);
        uint256 bobBalanceBefore = stablecoin.balanceOf(bob);

        claimWinnings(alice, marketId);
        claimWinnings(bob, marketId);

        // Full refunds
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + usdc(100));
        assertEq(stablecoin.balanceOf(bob), bobBalanceBefore + usdc(50));
    }

    /// @notice TC-IT-004: Proportional Payout Distribution
    function test_ProportionalPayout() public {
        uint256 marketId = createDefaultMarket();

        // A: 100 YES, B: 50 YES, C: 25 YES, D: 100 NO
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.Yes, usdc(50));
        placeBet(charlie, marketId, HashPrediction.Outcome.Yes, usdc(25));

        address dave = makeAddr("dave");
        stablecoin.mint(dave, usdc(1000));
        vm.prank(dave);
        stablecoin.approve(address(market), type(uint256).max);
        placeBet(dave, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // YES pool = 175, NO pool = 100
        // Alice: 100 + (100/175) * 100 = 100 + 57.14 = 157 (truncated)
        // Bob: 50 + (50/175) * 100 = 50 + 28.57 = 78 (truncated)
        // Charlie: 25 + (25/175) * 100 = 25 + 14.28 = 39 (truncated)

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);
        uint256 bobBalanceBefore = stablecoin.balanceOf(bob);
        uint256 charlieBalanceBefore = stablecoin.balanceOf(charlie);

        claimWinnings(alice, marketId);
        claimWinnings(bob, marketId);
        claimWinnings(charlie, marketId);

        // Creator reward: 1% of 275 = 2.75, from NO pool (100→97.25)
        // Check with some tolerance for rounding
        uint256 adjNoPool = usdc(100) - (usdc(275) * 100 / 10000); // 97250000
        assertApproxEqAbs(
            stablecoin.balanceOf(alice) - aliceBalanceBefore,
            usdc(100) + (usdc(100) * adjNoPool) / usdc(175),
            1
        );
        assertApproxEqAbs(
            stablecoin.balanceOf(bob) - bobBalanceBefore,
            usdc(50) + (usdc(50) * adjNoPool) / usdc(175),
            1
        );
        assertApproxEqAbs(
            stablecoin.balanceOf(charlie) - charlieBalanceBefore,
            usdc(25) + (usdc(25) * adjNoPool) / usdc(175),
            1
        );
    }

    /// @notice TC-IT-005: Single Bettor Wins All
    function test_SingleBettorWinsAll() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(50));
        placeBet(charlie, marketId, HashPrediction.Outcome.No, usdc(50));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId);

        // Creator reward: 1% of 200 = 2, from NO pool (100→98)
        // Alice gets: 100 + 98 = 198
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + usdc(198));
    }

    /// @notice TC-IT-007: Equal Pool Sizes
    function test_EqualPoolSizes() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId);

        // Creator reward: 1% of 200 = 2, from NO pool (100→98)
        // Alice gets: 100 + 98 = 198
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + usdc(198));
    }

    /// @notice TC-IT-008: Very Small Winning Pool
    function test_SmallWinningPool() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(1));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(1000));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId);

        // Creator reward: 1% of 1001 = 10.01, from NO pool (1000→989.99)
        // Alice gets: 1 + (1/1)*989.99 = 990.99
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + 990990000);
    }

    /// @notice TC-IT-009: Very Small Losing Pool
    function test_SmallLosingPool() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(1000));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(1));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId);

        // Creator reward: 1% of 1001 = 10.01, from NO pool (1→0 capped)
        // Reward capped to noPool=1, so noPool→0
        // Alice gets: 1000 + 0 = 1000
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + usdc(1000));
    }

    /// @notice TC-IT-010: Hedged Position On Resolved Market
    function test_HedgedPositionResolved() public {
        uint256 marketId = createDefaultMarket();

        // Alice bets both sides
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(alice, marketId, HashPrediction.Outcome.No, usdc(50));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId);

        // Creator reward: 1% of 250 = 2.5, from NO pool (150→147.5)
        // Alice's YES bet wins: 100 + (100/100) * 147.5 = 247.5
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + 247500000);
    }

    /// @notice TC-IT-011: Multiple Markets Same User
    function test_MultipleMarketsSameUser() public {
        uint256 marketId1 = createMarket("Question 1?", block.timestamp + ONE_WEEK, 0);
        uint256 marketId2 = createMarket("Question 2?", block.timestamp + ONE_WEEK, 0);

        placeBet(alice, marketId1, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId1, HashPrediction.Outcome.No, usdc(100));

        placeBet(alice, marketId2, HashPrediction.Outcome.No, usdc(100));
        placeBet(bob, marketId2, HashPrediction.Outcome.Yes, usdc(100));

        vm.warp(block.timestamp + ONE_WEEK + 1);

        resolveMarket(marketId1, HashPrediction.Outcome.Yes);
        resolveMarket(marketId2, HashPrediction.Outcome.No);

        uint256 aliceBalanceBefore = stablecoin.balanceOf(alice);

        claimWinnings(alice, marketId1);
        claimWinnings(alice, marketId2);

        // Market 1: reward=2, NO pool 100→98, Alice wins 100+98=198
        // Market 2: reward=2, YES pool 100→98, Alice wins 100+98=198
        // Total: 396
        assertEq(stablecoin.balanceOf(alice), aliceBalanceBefore + usdc(396));
    }

    /// @notice Test contract balance remains zero after all claims
    function test_ContractBalanceZeroAfterClaims() public {
        uint256 marketId = createDefaultMarket();

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        assertEq(stablecoin.balanceOf(address(market)), usdc(200));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        claimWinnings(alice, marketId);
        claimWinnings(bob, marketId);

        // All funds distributed
        assertEq(stablecoin.balanceOf(address(market)), 0);
    }
}
