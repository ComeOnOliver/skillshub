# Weekly Report Generation Skill

## 功能描述
基于本周评估的论文，生成每周精选报告，为精选论文创建独立知识库文档，并通过如流消息发送给指定用户。

## 核心流程

### 步骤1: 读取已评估论文数据

从 `evaluated_papers.json` 读取本周评估的论文：

```bash
# 读取已评估论文列表
cat workspace/papers/evaluated_papers.json
```

### 步骤2: 筛选本周论文并排序

```python
import json
from datetime import datetime, timedelta

# 读取已评估论文
with open('workspace/papers/evaluated_papers.json', 'r') as f:
    data = json.load(f)

# 筛选本周论文（最近7天）
week_start = datetime.now() - timedelta(days=7)
week_papers = [
    paper for paper in data['papers']
    if datetime.fromisoformat(paper['evaluated_date']) >= week_start
]

# 按综合评分排序（降序）
week_papers.sort(key=lambda x: x['final_score'], reverse=True)

# 取 Top 3 精选论文
top_papers = week_papers[:3]
```

### 步骤3: 为精选论文创建独立知识库文档

**重要更新**：每篇精选论文的完整总结单独创建知识库文档。

```python
# 为每篇精选论文创建独立的知识库文档
for paper in top_papers:
    # 生成论文完整总结文档
    summary_content = generate_summary_markdown(paper)
    doc_title = f"[{report_date}] {paper['short_title']} - 论文总结"
    
    # 创建知识库文档
    doc_url = client.create_doc(
        repository_guid="your_repository_guid",
        creator_username="your_username",
        title=doc_title,
        content=summary_content,
        parent_doc_guid="your_parent_doc_guid",
        create_mode=2
    )
    
    # 记录文档URL用于周报附录
    summary_doc_urls.append({
        'title': paper['title'],
        'url': doc_url
    })
```

### 步骤4: 生成 Markdown 周报

基于四维评分系统生成周报，**附录只包含精选论文的知识库文档链接**：

```markdown
## 📎 附录：精选论文完整总结

> 以下三篇精选论文的完整总结已上传至知识库，点击链接查看：

1. **论文标题**: [查看完整总结](知识库链接)
2. **论文标题**: [查看完整总结](知识库链接)
3. **论文标题**: [查看完整总结](知识库链接)
```

### 步骤5: 创建周报知识库文档

将周报本身也创建为知识库文档：

```python
# 创建周报知识库文档
result = client.create_doc(
    repository_guid="your_repository_guid",
    creator_username="your_username",
    title=f"周报 - {report_date}",
    content=report_content,
    parent_doc_guid="your_parent_doc_guid",
    create_mode=2
)
```

### 步骤6: 发送如流消息

使用如流消息 API 发送周报给指定用户：

```python
from send_message import GroupMessageSender

sender = GroupMessageSender()

# 发送简短消息 + 周报链接 + 精选论文链接
message = f"""
📊 **三维几何代理模型研究周报** - {report_date}

**报告周期**: {week_start} - {report_date}
**评估论文总数**: {len(week_papers)}
**精选推荐**: Top 3 精选论文

🏆 **本周Top 3论文**:
[论文列表]

📎 **周报链接**: {doc_url}

📄 **精选论文完整总结**:
1. [论文1](链接1)
2. [论文2](链接2)
3. [论文3](链接3)
"""

result = sender.send_app_message(
    to_users="your_username",
    msg_type="text",
    content=message
)
```

## 完整自动化脚本

脚本位置: `skills/weekly-report/scripts/generate_weekly_report_v2.py`

### 主要功能

1. **加载论文数据**: 从 `evaluated_papers.json` 读取
2. **筛选本周论文**: 最近7天评估的论文
3. **排序选择**: 按综合评分排序，取 Top 3 精选论文
4. **创建论文总结文档**: 为每篇精选论文创建独立知识库文档
5. **生成周报**: Markdown格式，附录只包含知识库链接
6. **创建周报文档**: 将周报创建为知识库文档
7. **发送如流消息**: 推送简短消息 + 周报链接 + 论文总结链接

## 使用方法

### 手动生成周报
```bash
# 执行周报生成脚本
python skills/weekly-report/scripts/generate_weekly_report_v2.py
```

### 在 Agent 中调用
```python
# 在 surrogate-modeling-expert agent 中执行
生成三维几何代理模型研究周报
```

## 配置说明

### 知识库配置

编辑周报生成脚本：

```python
# 知识库配置
self.ku_repo_id = "your_repository_guid"  # 你的知识库ID
self.ku_parent_doc_id = "your_parent_doc_guid"  # 你的父文档ID
```

### 如流消息接收人

编辑周报生成脚本：

```python
# 如流消息接收人
self.recipients = ["username1", "username2"]  # 替换为你的用户名
```

### Cron 定时任务

每周日早上 10 点自动生成并发送周报：

```json
{
  "name": "Weekly Report - Surrogate Modeling",
  "schedule": {
    "kind": "cron",
    "expr": "0 10 * * 0",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "生成三维几何代理模型研究周报，创建知识库文档并发送给指定用户"
  },
  "sessionTarget": "isolated"
}
```

## 注意事项

1. **数据源**：周报必须从 `evaluated_papers.json` 读取，确保数据一致性
2. **评分系统**：使用四维评分系统（工程应用、架构创新、理论贡献、可靠性）
3. **评分公式**：`最终综合评分 = 四维基础评分 × 0.9 + 影响力评分 × 0.1`
4. **知识库文档**：
   - 每篇精选论文创建独立的知识库文档（包含完整总结）
   - 周报文档的附录只包含知识库链接
5. **如流消息**：发送简短摘要 + 周报链接 + 论文总结链接
6. **权限要求**：需要 `COMATE_AUTH_TOKEN` 环境变量用于知识库API认证

## 更新日志

### v2.0 (2026-03-01)
- ✅ 添加知识库文档创建功能
- ✅ 周报推送包含知识库链接
- ✅ 优化消息格式，避免过长
- ✅ **重要更新**：精选论文完整总结单独创建知识库文档，周报附录只包含链接

