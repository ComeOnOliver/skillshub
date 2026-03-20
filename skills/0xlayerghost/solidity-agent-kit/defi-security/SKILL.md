---
name: defi-security
description: "[AUTO-INVOKE] MUST be invoked BEFORE deploying DeFi contracts (DEX, lending, staking, LP, token). Covers anti-whale, anti-MEV, flash loan protection, launch checklists, and emergency response. Trigger: any deployment or security review of DeFi-related contracts."
---

# DeFi Security Principles

## Language Rule

- **Always respond in the same language the user is using.** If the user asks in Chinese, respond in Chinese. If in English, respond in English.

> **Scope**: Only applicable to DeFi projects (DEX, lending, staking, LP, yield). Non-DeFi projects can ignore this skill.

## Protection Decision Rules

| Threat | Required Protection |
|--------|-------------------|
| Whale manipulation | Daily transaction caps + per-tx amount limits + cooldown window |
| MEV / sandwich attack | EOA-only checks (`msg.sender == tx.origin`), or use commit-reveal pattern |
| Arbitrage | Referral binding + liquidity distribution + fixed yield model + lock period |
| Reentrancy | `ReentrancyGuard` on all external-call functions (see solidity-security skill) |
| Flash loan attack | Check `block.number` change between operations, or use TWAP pricing |
| Price manipulation | Chainlink oracle or TWAP — never rely on spot AMM reserves for pricing |
| Approval exploit | Use `safeIncreaseAllowance` / `safeDecreaseAllowance`, never raw `approve` for user flows |
| Governance attack | Voting requires snapshot + minimum token holding period; timelock ≥ 48h on proposal execution |
| ERC4626 inflation attack | First deposit must enforce minimum amount or use virtual shares to prevent share dilution via rounding |
| Cross-vault trust bypass | Router/Registry relay must verify vault authorization; never trust caller identity inside flash loan callbacks — [EVMbench](https://cdn.openai.com/evmbench/evmbench.pdf)/[noya H-08](https://code4rena.com/reports/2024-04-noya) |
| Collateral ownership exploit | Liquidation/staking operations must verify actual NFT/collateral ownership — [EVMbench](https://cdn.openai.com/evmbench/evmbench.pdf)/[benddao](https://code4rena.com/reports/2024-07-benddao) |
| Bonding curve manipulation | ID/pricing params in create operations must be fully determined before external calls — [EVMbench](https://cdn.openai.com/evmbench/evmbench.pdf)/[phi H-06](https://code4rena.com/reports/2024-08-phi) |
| DEX pair `_transfer` TOCTOU | Never distinguish operation type by balance/reserve checks in `_transfer` — both directions are exploitable: buy vs removeLiquidity (`pair→user`) and sell vs addLiquidity (`user→pair`); use address whitelist only; new projects prefer Uniswap V4 Hook |

## Anti-Whale Implementation Rules

- Maximum single transaction amount: configurable via `onlyOwner` setter
- Daily cumulative limit per address: track with `mapping(address => mapping(uint256 => uint256))` (address → day → amount)
- Cooldown between transactions: enforce minimum time gap with `block.timestamp` check
- Whitelist for exempt addresses (deployer, LP pair, staking contract)

## Flash Loan Protection Rules

- For price-sensitive operations: require that `block.number` has changed since last interaction
- For oracle-dependent calculations: use time-weighted average (TWAP) over minimum 30 minutes
- For critical state changes: add minimum holding period before action (e.g., must hold tokens for N blocks)

## Protocol Composability Risks

> Source: [EVMbench (OpenAI/Paradigm, Feb 2026)](https://cdn.openai.com/evmbench/evmbench.pdf) — vulnerability patterns from Code4rena audits

- **Cross-vault operations** [[noya H-08](https://code4rena.com/reports/2024-04-noya)]: Registry/Router relay calls must verify vault-level authorization; prevent keeper from using flash loan to impersonate other vaults
- **Lending collateral** [[benddao](https://code4rena.com/reports/2024-07-benddao)]: Liquidation functions must verify `msg.sender` actually owns or is authorized to operate on target collateral
- **Bonding curve** [[phi H-06](https://code4rena.com/reports/2024-08-phi)]: In create + auto-buy operations, ID assignment and pricing params must be fully determined before the buy transaction executes; prevent reentrancy from modifying them
- **Shared registries** [[noya H-08](https://code4rena.com/reports/2024-04-noya)]: Permission propagation chains in shared registries must be verified hop-by-hop; never rely solely on "trusted sender" flags

## Launch Checklist

Before mainnet deployment, verify all items:

- [ ] All `onlyOwner` functions transferred to multisig wallet
- [ ] Timelock contract deployed and configured (minimum 24h delay for critical changes)
- [ ] Emergency pause mechanism tested — both pause and unpause functions work correctly
- [ ] Daily limit parameters documented and set to reasonable values
- [ ] Third-party security audit completed and all critical/high findings resolved
- [ ] Testnet deployment running for minimum 7 days with no issues
- [ ] Slippage, fee, and lock period parameters reviewed and documented
- [ ] Initial liquidity plan documented (amount, lock duration, LP token handling)
- [ ] Fuzz testing passes with high iterations (10000+) on all DeFi-critical functions

## Emergency Response Procedure

| Step | Action |
|------|--------|
| 1. Detect | Monitor alerts trigger (on-chain monitoring, community reports) |
| 2. Pause | Designated address calls `pause()` — must respond within minutes |
| 3. Assess | Technical lead analyzes root cause, estimates fund impact |
| 4. Communicate | Post incident notice to community channels (Discord, Twitter, Telegram) |
| 5. Fix | Deploy fix or prepare recovery plan |
| 6. Resume | Call `unpause()` after fix verified on fork — or migrate to new contract |
| 7. Post-mortem | Publish detailed incident report within 48 hours |

## DeFi Testing Reference

| Test Scenario | Approach |
|---------------|----------|
| Fuzz test fund flows | Run fuzz tests on staking/pool contracts with high iterations (10000+) |
| Fork mainnet testing | Use Foundry fork mode against mainnet RPC to test with real state |
| Simulate whale transaction | Use Foundry cast CLI to simulate large-amount calls on a forked network |
