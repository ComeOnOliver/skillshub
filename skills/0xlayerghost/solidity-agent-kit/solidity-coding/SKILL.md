---
name: solidity-coding
description: "[AUTO-INVOKE] MUST be invoked BEFORE writing or modifying any Solidity contract (.sol files). Covers pragma version, naming conventions, project layout, OpenZeppelin library selection standards, oracle integration, and anti-patterns. Trigger: any task involving creating, editing, or reviewing .sol source files."
---

# Solidity Coding Standards

## Language Rule

- **Always respond in the same language the user is using.** If the user asks in Chinese, respond in Chinese. If in English, respond in English.

## Coding Principles

- **Pragma**: Use `pragma solidity ^0.8.19;` — keep consistent across all files in the project
- **Dependencies**: OpenZeppelin Contracts 4.9.x, manage imports via `remappings.txt`
- **Error Handling**: Prefer custom errors over `require` strings — saves gas and is more expressive
  - Define: `error InsufficientBalance(uint256 available, uint256 required);`
  - Use: `if (balance < amount) revert InsufficientBalance(balance, amount);`
- **Documentation**: All `public` / `external` functions must have NatSpec (`@notice`, `@param`, `@return`)
- **Event Indexing**: Only add `indexed` to `address` type parameters — add comment if indexing other types
- **Special Keywords**: `immutable` / `constant` / `unchecked` / `assembly` must have inline comment explaining why

## Event Design Patterns

### Reason-Annotated Events（原因标注事件）

When an event represents a **conditional/branching outcome** (the same action can happen for different reasons), add a `string reason` parameter to make on-chain data self-documenting:

```solidity
// GOOD — on-chain data is self-explanatory
event WithdrawalFailed(address indexed user, uint256 amount, string reason);
emit WithdrawalFailed(user, amount, "insufficient balance");
emit WithdrawalFailed(user, amount, "cooldown not expired");

event ProposalRejected(uint256 indexed proposalId, string reason);
emit ProposalRejected(id, "quorum not reached");
emit ProposalRejected(id, "voting period ended");

// BAD — must read contract source to understand why
event WithdrawalFailed(address indexed user, uint256 amount);
```

**适用场景**：
- 资金去向分叉：同一笔资金因不同条件流向不同地址
- 操作被拒绝/降级：用户请求未完全满足，附带原因
- 状态转换：同一个状态变更可能由不同触发条件引起
- 管理员操作：记录 why（如 `"security incident"`, `"parameter tuning"`）

**不适用场景**：
- 事件只有一种触发路径（无分支）→ 不需要 reason
- 高频事件（每笔 swap/transfer）→ string 消耗额外 gas，用 `uint8 reasonCode` 代替

### Reason 实现方式选择

| 场景 | 方式 | Gas 成本 |
|------|------|----------|
| 原因种类少且固定（≤5种） | `string reason` 字面量 | 低（编译器优化短字符串） |
| 原因种类多或动态 | `uint8 reasonCode` + 前端映射表 | 最低 |
| 需要附带动态数据 | `string reason` 拼接 | 较高，慎用 |

```solidity
// 方式 A：string literal（推荐，可读性最好）
emit WithdrawalFailed(user, amount, "cooldown not expired");

// 方式 B：uint8 code（高频场景省 gas）
event SwapRejected(address indexed user, uint256 amount, uint8 reasonCode);
// 0 = slippage, 1 = insufficient liquidity, 2 = paused
emit SwapRejected(user, amount, 0);
```

### General Event Design Rules

- 每个改变状态的 `external` / `public` 函数**必须** emit 至少一个事件
- 事件参数应包含足够信息让前端/indexer **无需额外 RPC 调用**就能重建完整上下文
- NatSpec `@param` 必须为 reason 参数列出所有可能的值

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Contract / Library | PascalCase | `MyToken`, `StakingPool` |
| Interface | `I` + PascalCase | `IMyToken`, `IStakingPool` |
| State variable / Function | lowerCamelCase | `totalSupply`, `claimDividend` |
| Constant / Immutable | UPPER_SNAKE_CASE | `MAX_SUPPLY`, `ROUTER_ADDRESS` |
| Event | PascalCase (past tense) | `TokenTransferred`, `PoolCreated` |
| Custom Error | PascalCase | `InsufficientBalance`, `Unauthorized` |
| Function parameter | prefix `_` for setter | `function setFee(uint256 _fee)` |

- **Forbidden**: Pinyin names, single-letter variables (except `i/j/k` in loops), excessive abbreviations

## Code Organization Rules

| Situation | Rule |
|-----------|------|
| Cross-contract constants | Place in `src/common/Const.sol` |
| Interface definitions | Place in `src/interfaces/I<Name>.sol`, separate from implementation |
| Simple on-chain queries | Use Foundry cast CLI (call / send) |
| Complex multi-step operations | Use Foundry script (*.s.sol) |
| Import style | Use named imports: `import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";` |

## Project Directory Structure

```
src/              — Contract source code
  interfaces/     — Interface definitions (I*.sol)
  common/         — Shared constants, types, errors (Const.sol, Types.sol)
test/             — Test files (*.t.sol)
script/           — Deployment & interaction scripts (*.s.sol)
config/           — Network config, parameters (*.json)
deployments/      — Deployment records (latest.env)
docs/             — Documentation, changelogs
lib/              — Dependencies (managed by Foundry)
```

## Configuration Management

- `config/*.json` — network RPC URLs, contract addresses, business parameters
- `deployments/latest.env` — latest deployed contract addresses, must update after each deployment
- `foundry.toml` — compiler version, optimizer settings, remappings
- Important config changes must be documented in the PR description

## OpenZeppelin Library Selection Standards

When writing Solidity contracts, prioritize using battle-tested OpenZeppelin libraries over custom implementations. Select the appropriate library based on the scenario:

### Access Control

| Scenario | Library | Import Path |
|----------|---------|-------------|
| Single owner management | `Ownable` | `@openzeppelin/contracts/access/Ownable.sol` |
| Owner transfer needs safety | `Ownable2Step` | `@openzeppelin/contracts/access/Ownable2Step.sol` |
| Multi-role permission (admin/operator/minter) | `AccessControl` | `@openzeppelin/contracts/access/AccessControl.sol` |
| Need to enumerate role members | `AccessControlEnumerable` | `@openzeppelin/contracts/access/AccessControlEnumerable.sol` |
| Governance with timelock delay | `TimelockController` | `@openzeppelin/contracts/governance/TimelockController.sol` |

**Rule**: Single owner → `Ownable2Step`; 2+ roles → `AccessControl`; governance/DAO → `TimelockController`

### Security Protection

| Scenario | Library | Usage |
|----------|---------|-------|
| External call / token transfer | `ReentrancyGuard` | Add `nonReentrant` modifier |
| Emergency pause needed | `Pausable` | Add `whenNotPaused` to user-facing functions; keep admin functions unpaused |
| ERC20 token interaction | `SafeERC20` | Use `safeTransfer` / `safeTransferFrom` / `safeApprove` instead of raw calls |

**Rule**: Any contract that transfers tokens or ETH MUST use `ReentrancyGuard` + `SafeERC20`

### Token Standards

| Scenario | Library | Notes |
|----------|---------|-------|
| Fungible token | `ERC20` | Base standard |
| Token with burn mechanism | `ERC20Burnable` | Adds `burn()` and `burnFrom()` |
| Token with max supply cap | `ERC20Capped` | Enforces `totalSupply <= cap` |
| Gasless approval (EIP-2612) | `ERC20Permit` | Saves users approve tx gas |
| Governance voting token | `ERC20Votes` | Snapshot-based voting power |
| NFT | `ERC721` | Base NFT standard |
| NFT with enumeration | `ERC721Enumerable` | Supports `tokenOfOwnerByIndex` queries |
| Multi-token (FT + NFT mixed) | `ERC1155` | Game items, batch operations |

### Utility Libraries

| Scenario | Library | Usage |
|----------|---------|-------|
| Whitelist / airdrop verification | `MerkleProof` | Gas-efficient Merkle tree verification |
| Signature verification | `ECDSA` + `EIP712` | Off-chain sign + on-chain verify |
| Auto-increment IDs | `Counters` | Token ID, order ID generation |
| Batch function calls | `Multicall` | Multiple operations in one tx |
| Address set / uint set | `EnumerableSet` | Iterable sets with O(1) add/remove/contains |
| Revenue sharing | `PaymentSplitter` | Split ETH/token payments by shares |
| Standardized yield vault | `ERC4626` | DeFi vault standard |

### Contract Upgrade

| Scenario | Library | Notes |
|----------|---------|-------|
| Upgradeable contract (gas efficient) | `UUPSUpgradeable` | Upgrade logic in implementation contract |
| Upgradeable contract (admin separated) | `TransparentUpgradeableProxy` | Upgrade logic in proxy, higher gas |
| Initializer (replace constructor) | `Initializable` | Use `initializer` modifier instead of constructor |

**Rule**: New projects prefer `UUPSUpgradeable`; always use `Initializable` for upgradeable contracts

### Oracle and Off-Chain Services

| Scenario | Library | Notes |
|----------|---------|-------|
| Token price data | `AggregatorV3Interface` | Only for tokens with supported oracle data feeds |
| Verifiable randomness (lottery/NFT) | `VRFConsumerBaseV2` | On-chain provably fair random numbers |
| Automated execution (cron jobs) | `AutomationCompatible` | Replace centralized keepers |
| Cross-chain messaging | `CCIP` | Cross-chain token/message transfer |

### Library Selection Decision Flow

```
Does contract handle user funds/tokens?
├── YES → Add ReentrancyGuard + SafeERC20
│         Does it need emergency stop?
│         ├── YES → Add Pausable
│         └── NO  → Skip
└── NO  → Skip

How many admin roles needed?
├── 1 role  → Ownable2Step
├── 2+ roles → AccessControl
└── DAO/governance → TimelockController

Does contract need price data?
├── Token has oracle feed → AggregatorV3Interface
├── No oracle feed → Custom TWAP with min-liquidity check
└── No price needed → Skip

Will contract need upgrades?
├── YES → UUPSUpgradeable + Initializable
└── NO  → Standard deployment (immutable)
```

### Anti-Patterns (Do NOT)

- **Do NOT** write custom `transfer` wrappers — use `SafeERC20`
- **Do NOT** write custom access control modifiers — use `Ownable` / `AccessControl`
- **Do NOT** write custom pause logic — use `Pausable`
- **Do NOT** use `SafeMath` on Solidity >= 0.8.0 — overflow checks are built-in
- **Do NOT** use `require(token.transfer(...))` — use `token.safeTransfer(...)` via `SafeERC20`
- **Do NOT** use `tx.origin` for auth — use `msg.sender` with `Ownable` / `AccessControl`

## MCP-Assisted Contract Generation (if available)

When `OpenZeppelinContracts` MCP is configured, prefer using it to generate base contracts instead of writing from scratch:

| Contract Type | MCP Tool | When to Use |
|---|---|---|
| Fungible token | `solidity-erc20` | Any new ERC20 token contract |
| NFT | `solidity-erc721` | Any new NFT contract |
| Multi-token | `solidity-erc1155` | Game items, batch operations |
| Stablecoin | `solidity-stablecoin` | Stablecoin with ERC20 compliance |
| Real-world assets | `solidity-rwa` | Asset tokenization |
| Smart account | `solidity-account` | ERC-4337 account abstraction |
| Governance | `solidity-governor` | DAO voting and proposals |
| Custom | `solidity-custom` | Non-standard contracts with OZ patterns |

**Workflow**: MCP generates base → apply this skill's naming/structure rules → customize business logic → apply /solidity-security rules

**Why MCP over manual**: MCP output is validated against the same rule-set as OZ Contracts Wizard — imports, modifiers, security checks are guaranteed correct. Manual coding risks missing imports or using wrong OZ versions.

**When NOT to use MCP**: Heavily custom contracts with non-standard patterns, contracts that don't fit any OZ template, or when you need fine-grained control from line 1.

**Graceful degradation**: If MCP is not configured, fall back to the Library Selection Standards above and write contracts manually following all rules in this skill.

## Foundry Quick Reference

| Operation | Command |
|-----------|---------|
| Create new project | `forge init <project-name>` |
| Install dependency | `forge install openzeppelin-contracts` |
| Build contracts | `forge build` |
| Format code | `forge fmt` |
| Update remappings | `forge remappings` |
