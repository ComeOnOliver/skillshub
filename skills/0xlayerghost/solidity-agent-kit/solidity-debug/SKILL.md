---
name: solidity-debug
description: "[AUTO-INVOKE] MUST be invoked when debugging failed on-chain transactions. Covers transaction receipt analysis, gas diagnosis, calldata decoding, revert reason extraction, and state verification. Trigger: any task involving failed tx analysis, revert debugging, or on-chain transaction troubleshooting."
---

# Failed Transaction Debug Workflow

## Language Rule

- **Always respond in the same language the user is using.** If the user asks in Chinese, respond in Chinese. If in English, respond in English.

## Step 1: 获取交易回执 — 判断成功/失败

使用 Foundry cast CLI 查询交易回执（receipt），传入 tx hash 和 RPC endpoint。

**关注字段：**

| 字段 | 含义 |
|------|------|
| `status` | 0 = 失败, 1 = 成功 |
| `gasUsed` | 实际消耗的 gas |
| `logs` | 空数组 `[]` = 交易 revert，无事件发出 |
| `to` | 目标合约地址 |

## Step 2: 获取交易详情 — 拿到 gas limit 和 input

使用 Foundry cast CLI 查询交易详情（tx），传入 tx hash 和 RPC endpoint。

**关注字段：**

| 字段 | 含义 |
|------|------|
| `gas` | 发送方设置的 gas limit |
| `input` | 调用的 calldata（函数选择器 + 参数编码） |
| `from` / `to` | 发送方和目标合约 |
| `value` | 发送的原生代币数量 |

## Step 3: 判断失败类型 — gasUsed vs gas limit

| 现象 | 判断 | 解决方向 |
|------|------|---------|
| gasUsed / gas ≈ 100%（如 999,472 / 1,000,000） | **Out of Gas (OOG)** | 提高 gas limit 或估算 gas |
| gasUsed 远低于 gas limit（如 50,000 / 1,000,000） | **Revert** | 需获取 revert reason，见 Step 6 |
| gasUsed 正常但 status=0 | **内部调用失败** | 检查余额、授权、内部 call 返回值 |
| 交易根本没上链 | **Nonce/Gas Price 问题** | 检查 pending 队列 |

## Step 4: 解码函数选择器 — 确定调用了什么函数

使用 Foundry cast 的 4byte 功能，传入 input 的前 4 字节，查询对应的函数签名。

示例：输入 `0xb51a038a` → 输出 `unstake(uint256,address[],uint256[])`

## Step 5: 解码完整 calldata — 还原调用参数

使用 Foundry cast 的 calldata-decode 功能，传入 Step 4 得到的函数签名和完整 input data。

解码后的参数可用于：
- 分析入参是否有误
- 直接用于重试交易

## Step 6: 获取 Revert Reason（非 OOG 场景）

| 方法 | 说明 |
|------|------|
| 模拟调用 | 使用 Foundry cast call 在失败区块号上模拟，指定 from 地址和 block number，还原 revert 信息 |
| 重放交易 | 使用 Foundry cast run 重放交易（需要 archive 节点） |
| 在线分析平台 | 使用第三方交易分析平台查看详细调用栈（备用方案） |

## Step 7: 查询链上状态 — 确认交易失败后数据已回滚

使用 Foundry cast call 查询合约的 public 变量和 mapping，传入合约地址、函数签名及参数。

对于 struct 类型返回值，需按 ABI 顺序指定返回类型。

> 失败交易的状态变更会完全回滚，需确认数据仍在原始状态。

## Step 8: 对比成功 vs 失败交易 — 找差异

将成功和失败的交易放在一起对比：

| 对比维度 | 说明 |
|---------|------|
| gas 消耗 | 判断是否 OOG |
| 调用参数 | 判断是否入参问题 |
| 目标地址 | 判断是否调错合约 |
| 区块时间 | 判断是否有时间锁等限制 |
| 合约状态 | 判断是否前置条件不满足 |

## Step 9: 重试交易

| 场景 | 方法 |
|------|------|
| 正常重试 | 使用 Foundry cast send，不指定 gas limit（让节点自动估算） |
| 已知消耗范围 | 使用 Foundry cast send，指定较高 gas limit |

重试时使用 Foundry Keystore 管理签名身份，禁止在命令中明文传入私钥。

## 安全注意事项

| 规则 | 说明 |
|------|------|
| 私钥管理 | 使用 Foundry Keystore 管理签名身份，禁止明文传入私钥 |
| 模拟优先 | 真实发送前先用模拟调用确认不会 revert |
| 逐笔发送 | 批量重试时先发一笔验证，成功后再发剩余 |
| 状态确认 | 发送后确认 status=1，再查询链上状态确认变更生效 |

## 完整调试流程总结

| 步骤 | 操作 | 目的 |
|------|------|------|
| 1 | 查询交易回执 | 判断 status 是否为 0（失败） |
| 2 | 查询交易详情 | 获取 gas limit 和 input data |
| 3 | 对比 gasUsed vs gas limit | 区分 OOG 和 Revert |
| 4 | 解码函数选择器 | 确定调用了哪个函数 |
| 5 | 解码完整 calldata | 还原调用参数 |
| 6 | 模拟调用获取 revert reason | 获取具体失败原因 |
| 7 | 查询链上状态 | 确认数据已回滚 |
| 8 | 对比成功交易 | 找出差异点 |
| 9 | 修复后重试 | 使用 Keystore 签名发送，确认成功 |
