// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @title CategoryAndRewardTest
/// @notice Unit tests for T5 (Market Categories) and T11 (Creator Reward)
contract CategoryAndRewardTest is BaseTest {
    event CreatorRewardPaid(uint256 indexed marketId, address indexed creator, uint256 amount);

    // ============ T5: Market Categories ============

    /// @notice Market created with category stores it correctly
    function test_CreateMarket_WithCategory() public {
        vm.prank(alice);
        uint256 marketId = market.createMarket(
            "Will BTC hit 200k?",
            block.timestamp + ONE_WEEK,
            0,
            market.CATEGORY_CRYPTO()
        );

        HashPrediction.Market memory m = market.getMarket(marketId);
        assertEq(m.category, market.CATEGORY_CRYPTO());
    }

    /// @notice Market created with zero category (uncategorized)
    function test_CreateMarket_Uncategorized() public {
        vm.prank(alice);
        uint256 marketId = market.createMarket(
            "Will it rain?",
            block.timestamp + ONE_WEEK,
            0,
            bytes32(0)
        );

        HashPrediction.Market memory m = market.getMarket(marketId);
        assertEq(m.category, bytes32(0));
    }

    /// @notice All category constants are distinct
    function test_CategoryConstants_AreDistinct() public view {
        bytes32[5] memory cats = [
            market.CATEGORY_CRYPTO(),
            market.CATEGORY_SPORTS(),
            market.CATEGORY_POLITICS(),
            market.CATEGORY_ENTERTAINMENT(),
            market.CATEGORY_OTHER()
        ];

        for (uint256 i = 0; i < cats.length; i++) {
            assertTrue(cats[i] != bytes32(0), "Category should not be zero");
            for (uint256 j = i + 1; j < cats.length; j++) {
                assertTrue(cats[i] != cats[j], "Categories must be distinct");
            }
        }
    }

    /// @notice Custom bytes32 category works
    function test_CreateMarket_CustomCategory() public {
        bytes32 custom = keccak256("WEATHER");
        vm.prank(alice);
        uint256 marketId = market.createMarket(
            "Will it snow?",
            block.timestamp + ONE_WEEK,
            0,
            custom
        );

        assertEq(market.getMarket(marketId).category, custom);
    }

    // ============ T11: Creator Reward ============

    /// @notice Creator receives 1% reward on resolution (YES wins)
    function test_CreatorReward_YesWins() public {
        uint256 marketId = createDefaultMarket(); // creator = alice
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(200));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);

        uint256 aliceBefore = stablecoin.balanceOf(alice);

        // Total pool = 300, reward = 1% = 3 mUSDC
        vm.expectEmit(true, true, true, true);
        emit CreatorRewardPaid(marketId, alice, usdc(3));

        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // Alice (creator) should have received 3 mUSDC reward
        assertEq(stablecoin.balanceOf(alice), aliceBefore + usdc(3));
    }

    /// @notice Creator receives 1% reward on resolution (NO wins)
    function test_CreatorReward_NoWins() public {
        uint256 marketId = createDefaultMarket(); // creator = alice
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(200));

        warpToResolution(marketId);

        uint256 aliceBefore = stablecoin.balanceOf(alice);

        // Total pool = 300, reward = 1% = 3, deducted from YES (losing) pool
        resolveMarket(marketId, HashPrediction.Outcome.No);

        assertEq(stablecoin.balanceOf(alice), aliceBefore + usdc(3));
    }

    /// @notice Creator reward is zero when creatorRewardPercentage is 0
    function test_CreatorReward_ZeroPercentage() public {
        // Update config to 0% creator reward
        vm.prank(admin);
        market.updateConfig(feeRecipient, MAX_FEE_PERCENTAGE, 0);

        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);

        uint256 aliceBefore = stablecoin.balanceOf(alice);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // No reward paid
        assertEq(stablecoin.balanceOf(alice), aliceBefore);
    }

    /// @notice Creator reward doesn't apply on cancellation
    function test_CreatorReward_NotOnCancellation() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));

        warpToResolution(marketId);

        uint256 aliceBefore = stablecoin.balanceOf(alice);
        cancelMarket(marketId);

        // No reward on cancel
        assertEq(stablecoin.balanceOf(alice), aliceBefore);
    }

    /// @notice Creator reward is capped to losing pool size
    function test_CreatorReward_CappedToLosingPool() public {
        uint256 marketId = createDefaultMarket();
        // Huge YES pool, tiny NO pool
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(10000));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(1));

        warpToResolution(marketId);

        uint256 aliceBefore = stablecoin.balanceOf(alice);

        // Total = 10001, 1% = 100.01 USDC, but NO pool only has 1 USDC
        // Reward capped to 1 USDC (the entire losing pool)
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        assertEq(stablecoin.balanceOf(alice), aliceBefore + usdc(1));

        // NO pool should be 0 after reward
        HashPrediction.Market memory m = market.getMarket(marketId);
        assertEq(m.noPool, 0);
    }

    /// @notice Admin can update creator reward percentage
    function test_CreatorReward_AdminCanUpdate() public {
        vm.prank(admin);
        market.updateConfig(feeRecipient, MAX_FEE_PERCENTAGE, 200); // 2%

        HashPrediction.Config memory cfg = market.getConfig();
        assertEq(cfg.creatorRewardPercentage, 200);
    }

    /// @notice Creator reward percentage cannot exceed MAX_CREATOR_REWARD
    function test_CreatorReward_RevertIf_ExceedsMax() public {
        vm.prank(admin);
        vm.expectRevert(HashPrediction.InvalidFee.selector);
        market.updateConfig(feeRecipient, MAX_FEE_PERCENTAGE, 501); // > 5%
    }

    /// @notice Initialize rejects invalid creator reward percentage
    function test_Constructor_RevertIf_InvalidCreatorReward() public {
        HashPrediction impl = new HashPrediction();
        bytes memory initData = abi.encodeCall(
            HashPrediction.initialize,
            (address(stablecoin), DECIMALS, admin, feeRecipient, MAX_FEE_PERCENTAGE, 501)
        );
        vm.expectRevert();
        new ERC1967Proxy(address(impl), initData);
    }

    /// @notice Winner payout is reduced by creator reward
    function test_CreatorReward_ReducesWinnerPayout() public {
        uint256 marketId = createDefaultMarket();
        placeBet(alice, marketId, HashPrediction.Outcome.Yes, usdc(100));
        placeBet(bob, marketId, HashPrediction.Outcome.No, usdc(100));

        warpToResolution(marketId);
        resolveMarket(marketId, HashPrediction.Outcome.Yes);

        // Without reward: Alice gets 100 + 100 = 200
        // With 1% reward (2 mUSDC): NO pool 100→98, Alice gets 100 + 98 = 198
        uint256 payout = market.calculatePayout(marketId, alice);
        assertEq(payout, usdc(198));
    }
}
