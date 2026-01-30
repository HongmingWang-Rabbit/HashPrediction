// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HashPrediction} from "../src/HashPrediction.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @title SeedScript
/// @notice Seeds the deployed HashPrediction contract with sample markets and bets
/// @dev Run: forge script script/Seed.s.sol:SeedScript --rpc-url <rpc> --broadcast
///      Then wait 65s and run: forge script script/Seed.s.sol:SeedResolve --rpc-url <rpc> --broadcast
contract SeedScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        HashPrediction hp = HashPrediction(0xcC502F4b4Ebd5DF402Df83C7CbCE1c7E6FCA7787);
        MockERC20 token = MockERC20(0x896504918289f0B3B346574Fe47190074Cfd31Cc);

        console.log("=== Seed Script ===");
        console.log("Deployer:", deployer);
        console.log("Existing markets:", hp.marketCounter());

        vm.startBroadcast(pk);

        // Mint tokens for seeding
        token.mint(deployer, 1_000_000 * 1e6);
        token.approve(address(hp), type(uint256).max);

        // ============ ACTIVE MARKETS ============

        // Market 1: Active, far future, crypto
        uint256 id1 = hp.createMarket(
            "Will Bitcoin exceed $150,000 by end of 2026?",
            block.timestamp + 30 days,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id1, HashPrediction.Outcome.Yes, 500 * 1e6);
        hp.placeBet(id1, HashPrediction.Outcome.No, 300 * 1e6);
        console.log("Market", id1, "- Active (BTC 150k)");

        // Market 2: Active, near future
        uint256 id2 = hp.createMarket(
            "Will Ethereum flip Bitcoin in market cap by Q2 2026?",
            block.timestamp + 7 days,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id2, HashPrediction.Outcome.Yes, 200 * 1e6);
        hp.placeBet(id2, HashPrediction.Outcome.No, 800 * 1e6);
        console.log("Market", id2, "- Active (ETH flip)");

        // Market 3: Active, no bets
        uint256 id3 = hp.createMarket(
            "Will HashKey Chain reach 1M daily transactions by 2026?",
            block.timestamp + 14 days,
            0,
            keccak256("CRYPTO")
        );
        console.log("Market", id3, "- Active, no bets (HSK txns)");

        // Market 4: Active, heavy one side
        uint256 id4 = hp.createMarket(
            "Will the US approve a Solana spot ETF in 2026?",
            block.timestamp + 60 days,
            0,
            keccak256("POLITICS")
        );
        hp.placeBet(id4, HashPrediction.Outcome.Yes, 1000 * 1e6);
        hp.placeBet(id4, HashPrediction.Outcome.No, 150 * 1e6);
        console.log("Market", id4, "- Active (SOL ETF)");

        // ============ MARKETS THAT WILL BE RESOLVED/CANCELLED ============
        // These expire in 60s — run SeedResolve after they expire

        uint256 expiry = block.timestamp + 60;

        // Market 5: Will be resolved YES
        uint256 id5 = hp.createMarket(
            "Will gas fees on Ethereum stay below 10 gwei average this week?",
            expiry,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id5, HashPrediction.Outcome.Yes, 400 * 1e6);
        hp.placeBet(id5, HashPrediction.Outcome.No, 350 * 1e6);
        console.log("Market", id5, "- Pending resolve YES (ETH gas)");

        // Market 6: Will be cancelled (one-sided)
        uint256 id6 = hp.createMarket(
            "Will a new L1 chain overtake Solana in TVL this month?",
            expiry,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id6, HashPrediction.Outcome.No, 250 * 1e6);
        console.log("Market", id6, "- Pending cancel, one-sided (L1 vs SOL)");

        // Market 7: Will be resolved NO
        uint256 id7 = hp.createMarket(
            "Did Apple release a foldable iPhone in January 2026?",
            expiry,
            0,
            keccak256("ENTERTAINMENT")
        );
        hp.placeBet(id7, HashPrediction.Outcome.Yes, 300 * 1e6);
        hp.placeBet(id7, HashPrediction.Outcome.No, 700 * 1e6);
        console.log("Market", id7, "- Pending resolve NO (Apple foldable)");

        // Market 8: Will be resolved YES
        uint256 id8 = hp.createMarket(
            "Did HSK token trade above $1 in the first week of 2026?",
            expiry,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id8, HashPrediction.Outcome.Yes, 600 * 1e6);
        hp.placeBet(id8, HashPrediction.Outcome.No, 400 * 1e6);
        console.log("Market", id8, "- Pending resolve YES (HSK $1)");

        // Market 9: Will be cancelled (one-sided)
        uint256 id9 = hp.createMarket(
            "Was there a solar eclipse visible in North America in Jan 2026?",
            expiry,
            0,
            keccak256("OTHER")
        );
        hp.placeBet(id9, HashPrediction.Outcome.No, 200 * 1e6);
        console.log("Market", id9, "- Pending cancel (solar eclipse)");

        // Market 10: Will be resolved YES, high volume
        uint256 id10 = hp.createMarket(
            "Did Ethereum complete the Pectra upgrade by end of January 2026?",
            expiry,
            0,
            keccak256("CRYPTO")
        );
        hp.placeBet(id10, HashPrediction.Outcome.Yes, 2000 * 1e6);
        hp.placeBet(id10, HashPrediction.Outcome.No, 1500 * 1e6);
        console.log("Market", id10, "- Pending resolve YES (Pectra)");

        vm.stopBroadcast();

        console.log("\n=== Seed Complete ===");
        console.log("Total markets:", hp.marketCounter());
        console.log("\nWait 65 seconds, then run SeedResolve to finalize markets 5-10.");
    }
}

/// @title SeedResolve
/// @notice Resolves/cancels seeded markets (run 65s after SeedScript)
/// @dev Run: forge script script/Seed.s.sol:SeedResolve --rpc-url <rpc> --broadcast
contract SeedResolve is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        HashPrediction hp = HashPrediction(0xcC502F4b4Ebd5DF402Df83C7CbCE1c7E6FCA7787);

        console.log("=== Resolving/Cancelling Markets ===");

        vm.startBroadcast(pk);

        hp.resolveMarket(5, HashPrediction.Outcome.Yes);
        console.log("Market 5 resolved: YES wins");

        hp.cancelMarket(6);
        console.log("Market 6 cancelled");

        hp.resolveMarket(7, HashPrediction.Outcome.No);
        console.log("Market 7 resolved: NO wins");

        hp.resolveMarket(8, HashPrediction.Outcome.Yes);
        console.log("Market 8 resolved: YES wins");

        hp.cancelMarket(9);
        console.log("Market 9 cancelled");

        hp.resolveMarket(10, HashPrediction.Outcome.Yes);
        console.log("Market 10 resolved: YES wins");

        vm.stopBroadcast();

        console.log("\n=== All Done ===");
        console.log("Active: 1, 2, 3, 4");
        console.log("Resolved: 5 (YES), 7 (NO), 8 (YES), 10 (YES)");
        console.log("Cancelled: 6, 9");
    }
}
