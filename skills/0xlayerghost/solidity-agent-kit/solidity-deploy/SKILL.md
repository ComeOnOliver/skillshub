---
name: solidity-deploy
description: "[AUTO-INVOKE] MUST be invoked BEFORE deploying contracts or writing deployment scripts (*.s.sol). Covers pre-flight checks, forge script commands, post-deployment validation, and verification. Trigger: any task involving forge script, contract deployment, or block explorer verification."
---

# Deployment Workflow

## Language Rule

- **Always respond in the same language the user is using.** If the user asks in Chinese, respond in Chinese. If in English, respond in English.

## Pre-deployment Checklist (all must pass)

| Step | Command / Action |
|------|-----------------|
| Format code | `forge fmt` |
| Run all tests | `forge test` — zero failures required |
| Check gas report | `forge test --gas-report` — review critical functions |
| Verify config | Manually check `config/*.json` parameters |
| Dry-run | `forge script <Script> --fork-url <RPC_URL> -vvvv` (no `--broadcast`) |
| Check balance | `cast balance <DEPLOYER> --rpc-url <RPC_URL>` — sufficient gas? |
| Gas limit set | Deployment command must include `--gas-limit` |

## Deployment Decision Rules

| Situation | Rule |
|-----------|------|
| Default deployment | **No `--verify`** — contracts are not verified on block explorers by default |
| User requests verification | Add `--verify` and `--etherscan-api-key` to the command |
| Post-deploy verification | Use `forge verify-contract` as a separate step |
| Multi-chain deploy | Separate scripts per chain, never batch multiple chains in one script |
| Proxy deployment | Deploy implementation first, then proxy — verify both separately |
| **Upgradeable contract** | **Use OpenZeppelin Upgrades Plugin** (see below) — never hand-roll proxy deployment |

## Post-deployment Operations (all required)

1. Update addresses in `config/*.json` and `deployments/latest.env`
2. Test critical functions: `cast call` to verify on-chain state is correct
3. Record changes in `docs/CHANGELOG.md`
4. Submit PR with deployment transaction hash link
5. If verification needed, run `forge verify-contract` separately

## Key Security Rule

- **Never pass private keys directly in commands.** Use Foundry Keystore (`cast wallet import`) to manage keys securely.
- **Never include `--broadcast` in templates.** The user must explicitly add it when ready to deploy.

## Command Templates

```bash
# Dry-run (simulation only, no on-chain execution)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url <RPC_URL> \
  --gas-limit 5000000 \
  -vvvv

# When user is ready to deploy, instruct them to add:
#   --account <KEYSTORE_NAME> --broadcast

# Verify existing contract separately
forge verify-contract <ADDRESS> <CONTRACT> \
  --chain-id <CHAIN_ID> \
  --etherscan-api-key <API_KEY> \
  --constructor-args $(cast abi-encode "constructor(address)" <ARG>)

# Quick on-chain read test after deployment
cast call <CONTRACT_ADDRESS> "functionName()" --rpc-url <RPC_URL>
```

## Upgradeable Contract Deployment (OpenZeppelin Upgrades Plugin)

For any upgradeable contract (UUPS, Transparent, Beacon), use the OpenZeppelin Foundry Upgrades Plugin instead of hand-rolling proxy deployment scripts.

### Why Use the Plugin

| Manual Approach | With Plugin |
|---|---|
| ~30 lines: deploy impl → deploy proxy → encode initializer → wire up | **1 line**: `Upgrades.deployUUPSProxy(...)` |
| ~20 lines: deploy new impl → validate storage → upgrade proxy | **1 line**: `Upgrades.upgradeProxy(...)` |
| Storage layout compatibility: check by eye | **Auto-checked**, incompatible layouts are rejected |
| Forgot `_disableInitializers()`? No warning | **Auto-validated** |

### Installation

```bash
forge install OpenZeppelin/openzeppelin-foundry-upgrades
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
```

Add to `remappings.txt`:
```
@openzeppelin/contracts/=lib/openzeppelin-contracts-upgradeable/lib/openzeppelin-contracts/contracts/
@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/
```

### Deploy Script Template (UUPS)

```solidity
// script/Deploy.s.sol
import {Script, console} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {MyContract} from "../src/MyContract.sol";

contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();

        // One line: deploys impl + proxy + calls initialize
        address proxy = Upgrades.deployUUPSProxy(
            "MyContract.sol",
            abi.encodeCall(MyContract.initialize, (msg.sender))
        );

        console.log("Proxy:", proxy);
        console.log("Impl:", Upgrades.getImplementationAddress(proxy));

        vm.stopBroadcast();
    }
}
```

### Upgrade Script Template

```solidity
// script/Upgrade.s.sol
import {Script, console} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract UpgradeScript is Script {
    function run() public {
        address proxy = vm.envAddress("PROXY_ADDRESS");
        vm.startBroadcast();

        // One line: validates storage layout + deploys new impl + upgrades proxy
        Upgrades.upgradeProxy(proxy, "MyContractV2.sol", "");

        console.log("Upgraded. New impl:", Upgrades.getImplementationAddress(proxy));

        vm.stopBroadcast();
    }
}
```

Add `@custom:oz-upgrades-from MyContract` annotation to V2 contract for automatic reference:

```solidity
/// @custom:oz-upgrades-from MyContract
contract MyContractV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // ...
}
```

### Commands

```bash
# Deploy proxy (dry-run) — --ffi is required for storage layout checks
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --ffi -vvvv

# Deploy proxy (broadcast)
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --ffi --account <KEYSTORE_NAME> --broadcast

# Upgrade proxy (dry-run)
PROXY_ADDRESS=0x... forge script script/Upgrade.s.sol --rpc-url <RPC_URL> --ffi -vvvv

# Upgrade proxy (broadcast)
PROXY_ADDRESS=0x... forge script script/Upgrade.s.sol --rpc-url <RPC_URL> --ffi --account <KEYSTORE_NAME> --broadcast

# Validate upgrade without deploying (useful for CI)
# Use Upgrades.validateUpgrade("MyContractV2.sol", opts) in a test
```

### Plugin API Quick Reference

| Function | Purpose |
|---|---|
| `Upgrades.deployUUPSProxy(contract, data)` | Deploy UUPS proxy + impl + initialize |
| `Upgrades.deployTransparentProxy(contract, admin, data)` | Deploy Transparent proxy + impl + initialize |
| `Upgrades.upgradeProxy(proxy, newContract, data)` | Validate + deploy new impl + upgrade |
| `Upgrades.validateUpgrade(contract, opts)` | Validate only, no deploy (for CI/tests) |
| `Upgrades.getImplementationAddress(proxy)` | Get current implementation address |
| `Upgrades.prepareUpgrade(contract, opts)` | Validate + deploy new impl, return address (for multisig) |

### Key Rules

- **Always use `--ffi` flag** — the plugin needs it for storage layout validation
- **Always add `--sender <ADDRESS>` for upgrades** — must match proxy owner, otherwise `OwnableUnauthorizedAccount`
- **Use `Upgrades` in scripts, `UnsafeUpgrades` only in tests** — `UnsafeUpgrades` skips all safety checks
- **Keep V1 source code in project** when upgrading — plugin needs it for storage comparison. Or use `@custom:oz-upgrades-from` annotation
- **Never hand-roll proxy deployment** when this plugin is available — the storage layout check alone prevents critical bugs
