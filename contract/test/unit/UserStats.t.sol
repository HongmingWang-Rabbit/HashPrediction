// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";

/// @title UserStatsTest
/// @notice Unit tests for T1 (UserStats/Leaderboard) and T9 (Daily Streaks)
contract UserStatsTest is BaseTest {
    event StreakUpdated(address indexed user, uint256 streak);

    // ============ T1: UserStats Tracking ============

    /// @notice getUserStats returns zeroes for new address
    function test_GetUserStats_Default() public view {
        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalBets, 0);
        assertEq(s.totalWins, 0);
        assertEq(s.totalLosses, 0);
        assertEq(s.totalVolume, 0);
        assertEq(s.currentStreak, 0);
        assertEq(s.bestStreak, 0);
    }

    /// @notice placeBet increments totalBets and totalVolume
    function test_Stats_BetTracking() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(alice, marketId, HashPrediction.Outcome.No, usdc(50));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalBets, 2);
        assertEq(s.totalVolume, usdc(150));
    }

    /// @notice Claiming a win increments totalWins and currentStreak
    function test_Stats_WinTracking() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);
        claimWinnings(alice, marketId);

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalWins, 1);
        assertEq(s.totalLosses, 0);
        assertEq(s.currentStreak, 1);
        assertEq(s.bestStreak, 1);
    }

    /// @notice Claiming a loss increments totalLosses and resets currentStreak
    function test_Stats_LossTracking() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.No);
        claimWinnings(alice, marketId); // Alice loses

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalWins, 0);
        assertEq(s.totalLosses, 1);
        assertEq(s.currentStreak, 0);
    }

    /// @notice Win streak tracks across multiple markets
    function test_Stats_WinStreak() public {
        // Market 1: Alice wins
        uint256 m1 = createDefaultMarket();
        placeBet(alice, m1, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m1, HashPrediction.Outcome.No, usdc(100));
        warpToResolution(m1);
        resolveMarket(m1, HashPrediction.Outcome.Yes);
        claimWinnings(alice, m1);

        // Market 2: Alice wins again
        vm.warp(block.timestamp + 1);
        vm.prank(alice);
        uint256 m2 = market.createMarket("Q2?", block.timestamp + ONE_WEEK, 0, bytes32(0));
        placeBet(alice, m2, HashPrediction.Outcome.No, usdc(100));
        placeBet(bob, m2, HashPrediction.Outcome.Yes, usdc(100));
        warpToResolution(m2);
        resolveMarket(m2, HashPrediction.Outcome.No);
        claimWinnings(alice, m2);

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalWins, 2);
        assertEq(s.currentStreak, 2);
        assertEq(s.bestStreak, 2);
    }

    /// @notice Best streak is preserved after loss
    function test_Stats_BestStreakPreserved() public {
        // Win 2, then lose 1
        uint256 m1 = createDefaultMarket();
        placeBet(alice, m1, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m1, HashPrediction.Outcome.No, usdc(100));
        warpToResolution(m1);
        resolveMarket(m1, HashPrediction.Outcome.Yes);
        claimWinnings(alice, m1);

        vm.warp(block.timestamp + 1);
        vm.prank(alice);
        uint256 m2 = market.createMarket("Q2?", block.timestamp + ONE_WEEK, 0, bytes32(0));
        placeBet(alice, m2, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m2, HashPrediction.Outcome.No, usdc(100));
        warpToResolution(m2);
        resolveMarket(m2, HashPrediction.Outcome.Yes);
        claimWinnings(alice, m2);

        // Now lose
        vm.warp(block.timestamp + 1);
        vm.prank(alice);
        uint256 m3 = market.createMarket("Q3?", block.timestamp + ONE_WEEK, 0, bytes32(0));
        placeBet(alice, m3, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m3, HashPrediction.Outcome.No, usdc(100));
        warpToResolution(m3);
        resolveMarket(m3, HashPrediction.Outcome.No);
        claimWinnings(alice, m3);

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.currentStreak, 0);
        assertEq(s.bestStreak, 2);
    }

    /// @notice claimMultipleWinnings updates stats for each market
    function test_Stats_ClaimMultiple() public {
        uint256 m1 = createDefaultMarket();
        placeBet(alice, m1, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m1, HashPrediction.Outcome.No, usdc(100));

        vm.warp(block.timestamp + 1);
        vm.prank(alice);
        uint256 m2 = market.createMarket("Q2?", block.timestamp + ONE_WEEK, 0, bytes32(0));
        placeBet(alice, m2, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, m2, HashPrediction.Outcome.No, usdc(100));

        // Resolve both as YES wins
        warpToResolution(m2);
        resolveMarket(m1, HashPrediction.Outcome.Yes);
        resolveMarket(m2, HashPrediction.Outcome.Yes);

        uint256[] memory ids = new uint256[](2);
        ids[0] = m1;
        ids[1] = m2;
        vm.prank(alice);
        market.claimMultipleWinnings(ids);

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalWins, 2);
        assertEq(s.currentStreak, 2);
        assertEq(s.bestStreak, 2);
    }

    /// @notice Cancelled market claims don't affect win/loss stats
    function test_Stats_CancelledNoWinLoss() public {
        uint256 m1 = createDefaultMarket();
        placeBet(alice, m1, HashPrediction.Outcome.Yes, usdc(100));
        warpToResolution(m1);
        cancelMarket(m1);
        claimWinnings(alice, m1);

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.totalWins, 0);
        assertEq(s.totalLosses, 0);
        // Bets still counted
        assertEq(s.totalBets, 1);
    }

    // ============ T9: Daily Streak ============

    /// @notice First bet sets dailyStreak to 1
    function test_DailyStreak_FirstBet() public {
        uint256 marketId = createDefaultMarket();

        vm.expectEmit(true, true, true, true);
        emit StreakUpdated(alice, 1);

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.dailyStreak, 1);
        assertEq(s.lastBetDay, block.timestamp / 86400);
    }

    /// @notice Same day bets don't change streak
    function test_DailyStreak_SameDay() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(alice, marketId, HashPrediction.Outcome.No, usdc(50));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.dailyStreak, 1);
    }

    /// @notice Consecutive day increments streak
    function test_DailyStreak_ConsecutiveDay() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        // Warp to next day
        vm.warp(block.timestamp + 86400);

        vm.expectEmit(true, true, true, true);
        emit StreakUpdated(alice, 2);

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.dailyStreak, 2);
    }

    /// @notice Missing a day resets streak to 1
    function test_DailyStreak_MissedDay() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        // Skip 2 days
        vm.warp(block.timestamp + 86400 * 2);

        vm.expectEmit(true, true, true, true);
        emit StreakUpdated(alice, 1);

        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.dailyStreak, 1);
    }

    /// @notice Multi-day streak tracking
    function test_DailyStreak_MultiDay() public {
        uint256 marketId = createDefaultMarket();

        // Day 1
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(10));

        // Day 2
        vm.warp(block.timestamp + 86400);
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(10));

        // Day 3
        vm.warp(block.timestamp + 86400);
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(10));

        HashPrediction.UserStats memory s = market.getUserStats(alice);
        assertEq(s.dailyStreak, 3);
        assertEq(s.totalBets, 3);
    }
}
