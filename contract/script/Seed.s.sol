// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HashPrediction} from "../src/HashPrediction.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @title SeedScript
/// @notice Seeds the deployed HashPrediction contract with sample markets and bets
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
        token.mint(deployer, 100_000 * 1e6);

        // Approve large amount
        token.approve(address(hp), type(uint256).max);

        // --- Market 1: Active, far future, with bets ---
        uint256 id1 = hp.createMarket(
            "Will Bitcoin exceed $150,000 by end of 2026?",
            block.timestamp + 30 days,
            0,
            bytes32(0)
        );
        hp.placeBet(id1, HashPrediction.Outcome.Yes, 500 * 1e6);
        hp.placeBet(id1, HashPrediction.Outcome.No, 300 * 1e6);
        console.log("Market", id1, "- Active with bets (BTC 150k)");

        // --- Market 2: Active, near future, with bets ---
        uint256 id2 = hp.createMarket(
            "Will Ethereum flip Bitcoin in market cap by Q2 2026?",
            block.timestamp + 7 days,
            0,
            bytes32(0)
        );
        hp.placeBet(id2, HashPrediction.Outcome.Yes, 200 * 1e6);
        hp.placeBet(id2, HashPrediction.Outcome.No, 800 * 1e6);
        console.log("Market", id2, "- Active with bets (ETH flip)");

        // --- Market 3: Active, no bets yet ---
        uint256 id3 = hp.createMarket(
            "Will HashKey Chain reach 1M daily transactions by 2026?",
            block.timestamp + 14 days,
            0,
            bytes32(0)
        );
        console.log("Market", id3, "- Active, no bets (HSK txns)");

        // --- Market 4: Active, one-sided bets ---
        uint256 id4 = hp.createMarket(
            "Will the US approve a Solana spot ETF in 2026?",
            block.timestamp + 60 days,
            0,
            bytes32(0)
        );
        hp.placeBet(id4, HashPrediction.Outcome.Yes, 1000 * 1e6);
        hp.placeBet(id4, HashPrediction.Outcome.No, 150 * 1e6);
        console.log("Market", id4, "- Active with heavy YES (SOL ETF)");

        // --- Market 5: Expires very soon (resolve via admin shortly after) ---
        uint256 id5 = hp.createMarket(
            "Will gas fees on Ethereum stay below 10 gwei average this week?",
            block.timestamp + 5 minutes,
            0,
            bytes32(0)
        );
        hp.placeBet(id5, HashPrediction.Outcome.Yes, 400 * 1e6);
        hp.placeBet(id5, HashPrediction.Outcome.No, 350 * 1e6);
        console.log("Market", id5, "- Expires in 5 min, resolvable soon (ETH gas)");

        // --- Market 6: Expires soon, one-sided (cancel only once expired) ---
        uint256 id6 = hp.createMarket(
            "Will a new L1 chain overtake Solana in TVL this month?",
            block.timestamp + 5 minutes,
            0,
            bytes32(0)
        );
        hp.placeBet(id6, HashPrediction.Outcome.No, 250 * 1e6);
        console.log("Market", id6, "- Expires in 5 min, one-sided, cancel only (L1 vs SOL)");

        vm.stopBroadcast();

        console.log("\n=== Seed Complete ===");
        console.log("Total markets now:", hp.marketCounter());
    }
}
