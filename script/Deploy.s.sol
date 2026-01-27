// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {HashPrediction} from "../src/HashPrediction.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @title Deploy
/// @notice Deploys the HashPrediction contract with HashKey Chain support
contract Deploy is Script {
    // Default values (can be overridden via environment variables)
    uint8 constant DEFAULT_DECIMALS = 6;
    uint256 constant DEFAULT_MAX_FEE = 500; // 5%
    uint256 constant MOCK_INITIAL_SUPPLY = 1_000_000 * 10 ** DEFAULT_DECIMALS;

    function run() external {
        // Load configuration from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Admin and fee recipient (default to deployer)
        address admin = vm.envOr("ADMIN_ADDRESS", deployer);
        address feeRecipient = vm.envOr("FEE_RECIPIENT", deployer);
        uint256 maxFeePercentage = vm.envOr("MAX_FEE_PERCENTAGE", DEFAULT_MAX_FEE);

        console.log("=== HashPrediction Deployment ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Admin:", admin);
        console.log("Fee Recipient:", feeRecipient);
        console.log("Max Fee Percentage:", maxFeePercentage, "basis points");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy mock stablecoin for testnet or use existing on mainnet
        address stablecoinAddress;
        uint8 stablecoinDecimals;

        if (block.chainid == 133) {
            // HashKey Testnet - deploy mock USDC
            console.log("\nDeploying Mock USDC on HashKey Testnet...");
            MockERC20 mockToken = new MockERC20("Mock USDC", "mUSDC", DEFAULT_DECIMALS);
            stablecoinAddress = address(mockToken);
            stablecoinDecimals = DEFAULT_DECIMALS;

            // Mint initial supply to deployer
            mockToken.mint(deployer, MOCK_INITIAL_SUPPLY);
            console.log("Mock USDC deployed:", stablecoinAddress);
            console.log("Minted", MOCK_INITIAL_SUPPLY, "tokens to deployer");
        } else if (block.chainid == 177) {
            // HashKey Mainnet - use env variable
            console.log("\nUsing existing stablecoin on HashKey Mainnet...");
            stablecoinAddress = vm.envAddress("STABLECOIN_ADDRESS");
            stablecoinDecimals = uint8(vm.envUint("STABLECOIN_DECIMALS"));
            console.log("Stablecoin:", stablecoinAddress);
        } else {
            // Other networks - check for existing or deploy mock
            address existingStablecoin = vm.envOr("STABLECOIN_ADDRESS", address(0));
            if (existingStablecoin != address(0)) {
                stablecoinAddress = existingStablecoin;
                stablecoinDecimals = uint8(vm.envOr("STABLECOIN_DECIMALS", uint256(DEFAULT_DECIMALS)));
                console.log("\nUsing existing stablecoin:", stablecoinAddress);
            } else {
                console.log("\nDeploying Mock USDC...");
                MockERC20 mockToken = new MockERC20("Mock USDC", "mUSDC", DEFAULT_DECIMALS);
                stablecoinAddress = address(mockToken);
                stablecoinDecimals = DEFAULT_DECIMALS;
                mockToken.mint(deployer, MOCK_INITIAL_SUPPLY);
                console.log("Mock USDC deployed:", stablecoinAddress);
            }
        }

        // Deploy HashPrediction
        console.log("\nDeploying HashPrediction...");
        HashPrediction prediction = new HashPrediction(
            stablecoinAddress,
            stablecoinDecimals,
            admin,
            feeRecipient,
            maxFeePercentage
        );

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("HashPrediction:", address(prediction));
        console.log("Stablecoin:", stablecoinAddress);
        console.log("Stablecoin Decimals:", stablecoinDecimals);

        // Verify configuration
        console.log("\n=== Verification ===");
        HashPrediction.Config memory config = prediction.getConfig();
        console.log("Config Admin:", config.admin);
        console.log("Config Fee Recipient:", config.feeRecipient);
        console.log("Config Max Fee:", config.maxFeePercentage);
        console.log("Config Paused:", config.paused);
    }
}
