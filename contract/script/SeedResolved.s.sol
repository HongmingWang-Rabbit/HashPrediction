// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HashPrediction} from "../src/HashPrediction.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @title SeedResolvedScript
/// @notice Creates markets that expire very soon for resolving/cancelling
contract SeedResolvedScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        HashPrediction hp = HashPrediction(0xcC502F4b4Ebd5DF402Df83C7CbCE1c7E6FCA7787);
        MockERC20 token = MockERC20(0x896504918289f0B3B346574Fe47190074Cfd31Cc);

        vm.startBroadcast(pk);

        token.mint(vm.addr(pk), 500_000 * 1e6);
        token.approve(address(hp), type(uint256).max);

        // All expire in 2 seconds
        uint256 expiry = block.timestamp + 60;

        uint256 id7 = hp.createMarket("Did Apple release a foldable iPhone in January 2026?", expiry, 0, keccak256("ENTERTAINMENT"));
        hp.placeBet(id7, HashPrediction.Outcome.Yes, 300 * 1e6);
        hp.placeBet(id7, HashPrediction.Outcome.No, 700 * 1e6);

        uint256 id8 = hp.createMarket("Did HSK token trade above $1 in the first week of 2026?", expiry, 0, keccak256("CRYPTO"));
        hp.placeBet(id8, HashPrediction.Outcome.Yes, 600 * 1e6);
        hp.placeBet(id8, HashPrediction.Outcome.No, 400 * 1e6);

        uint256 id9 = hp.createMarket("Was there a solar eclipse visible in North America in Jan 2026?", expiry, 0, keccak256("OTHER"));
        hp.placeBet(id9, HashPrediction.Outcome.No, 200 * 1e6);

        uint256 id10 = hp.createMarket("Did Ethereum complete the Pectra upgrade by end of January 2026?", expiry, 0, keccak256("CRYPTO"));
        hp.placeBet(id10, HashPrediction.Outcome.Yes, 2000 * 1e6);
        hp.placeBet(id10, HashPrediction.Outcome.No, 1500 * 1e6);

        vm.stopBroadcast();

        console.log("Created markets 7-10 with 2s expiry. Run ResolveSeeded next.");
    }
}

/// @title ResolveSeededScript
/// @notice Resolves/cancels the seeded markets (run after they expire)
contract ResolveSeededScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        HashPrediction hp = HashPrediction(0xcC502F4b4Ebd5DF402Df83C7CbCE1c7E6FCA7787);

        vm.startBroadcast(pk);

        hp.resolveMarket(7, HashPrediction.Outcome.No);
        console.log("Market 7 resolved: NO wins");

        hp.resolveMarket(8, HashPrediction.Outcome.Yes);
        console.log("Market 8 resolved: YES wins");

        hp.cancelMarket(9);
        console.log("Market 9 cancelled");

        hp.resolveMarket(10, HashPrediction.Outcome.Yes);
        console.log("Market 10 resolved: YES wins");

        vm.stopBroadcast();
    }
}
