// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../BaseTest.sol";

/// @title AccessControlTest
/// @notice Unit tests for access control functionality
contract AccessControlTest is BaseTest {
    // ============ Config Update Tests ============

    /// @notice TC-AC-001: Admin Can Update Config
    function test_UpdateConfig_AsAdmin() public {
        vm.expectEmit(true, true, true, true);
        emit ConfigUpdated(admin, charlie, 100);

        vm.prank(admin);
        market.updateConfig(charlie, 100, 100);

        HashPrediction.Config memory cfg = market.getConfig();
        assertEq(cfg.feeRecipient, charlie);
        assertEq(cfg.maxFeePercentage, 100);
    }

    /// @notice TC-AC-002: Non-Admin Cannot Update Config
    function test_UpdateConfig_RevertIf_NonAdmin() public {
        vm.prank(alice);
        vm.expectRevert(HashPrediction.NotAdmin.selector);
        market.updateConfig(charlie, 100, 100);
    }

    /// @notice Test max fee limit enforcement
    function test_UpdateConfig_RevertIf_FeeExceedsLimit() public {
        vm.prank(admin);
        vm.expectRevert(HashPrediction.InvalidFee.selector);
        market.updateConfig(feeRecipient, 1001, 100); // > 10%
    }

    // ============ Pause Tests ============

    /// @notice TC-AC-003: Admin Can Pause
    function test_Pause_AsAdmin() public {
        vm.expectEmit(true, true, true, true);
        emit ContractPaused(admin);

        vm.prank(admin);
        market.pause();

        HashPrediction.Config memory cfg = market.getConfig();
        assertTrue(cfg.paused);
    }

    /// @notice TC-AC-004: Non-Admin Cannot Pause
    function test_Pause_RevertIf_NonAdmin() public {
        vm.prank(alice);
        vm.expectRevert(HashPrediction.NotAdmin.selector);
        market.pause();
    }

    /// @notice Test double pause
    function test_Pause_RevertIf_AlreadyPaused() public {
        vm.prank(admin);
        market.pause();

        vm.prank(admin);
        vm.expectRevert(HashPrediction.AlreadyPaused.selector);
        market.pause();
    }

    // ============ Unpause Tests ============

    /// @notice TC-AC-005: Admin Can Unpause
    function test_Unpause_AsAdmin() public {
        vm.prank(admin);
        market.pause();

        vm.expectEmit(true, true, true, true);
        emit ContractUnpaused(admin);

        vm.prank(admin);
        market.unpause();

        HashPrediction.Config memory cfg = market.getConfig();
        assertFalse(cfg.paused);
    }

    /// @notice Test unpause when not paused
    function test_Unpause_RevertIf_NotPaused() public {
        vm.prank(admin);
        vm.expectRevert(HashPrediction.NotPaused.selector);
        market.unpause();
    }

    /// @notice Non-admin cannot unpause
    function test_Unpause_RevertIf_NonAdmin() public {
        vm.prank(admin);
        market.pause();

        vm.prank(alice);
        vm.expectRevert(HashPrediction.NotAdmin.selector);
        market.unpause();
    }

    // ============ Constructor Tests ============

    /// @notice Test constructor with invalid stablecoin
    function test_Constructor_RevertIf_ZeroStablecoin() public {
        vm.expectRevert(HashPrediction.InvalidMarket.selector);
        new HashPrediction(
            address(0),
            DECIMALS,
            admin,
            feeRecipient,
            MAX_FEE_PERCENTAGE,
            100
        );
    }

    /// @notice Test constructor with invalid admin
    function test_Constructor_RevertIf_ZeroAdmin() public {
        vm.expectRevert(HashPrediction.NotAdmin.selector);
        new HashPrediction(
            address(stablecoin),
            DECIMALS,
            address(0),
            feeRecipient,
            MAX_FEE_PERCENTAGE,
            100
        );
    }

    /// @notice Test constructor with invalid max fee
    function test_Constructor_RevertIf_InvalidMaxFee() public {
        vm.expectRevert(HashPrediction.InvalidFee.selector);
        new HashPrediction(
            address(stablecoin),
            DECIMALS,
            admin,
            feeRecipient,
            1001, // > 10%
            100
        );
    }
}
