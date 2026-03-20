# Semantic Scholar API Skill

## 功能描述
通过 Semantic Scholar API 获取学术论文的完整元数据，包括引用数、作者信息、发表场所等。

## API 客户端

脚本位置: `skills/semantic-scholar/semantic_scholar_api.py`

### 主要功能

1. **通过 arXiv ID 获取论文数据**（推荐，最准确）
2. **通过标题搜索论文**
3. **获取论文引用数据**
4. **获取作者影响力数据**

## 使用方法

### 1. 通过 arXiv ID 获取论文数据

```bash
# 获取论文数据（JSON格式）
python skills/semantic-scholar/semantic_scholar_api.py paper-by-arxiv "1910.03193" --format json

# 获取论文数据（可读格式）
python skills/semantic-scholar/semantic_scholar_api.py paper-by-arxiv "1910.03193"
```

### 2. 通过标题搜索论文

```bash
# 搜索论文（JSON格式）
python skills/semantic-scholar/semantic_scholar_api.py paper-by-title "Learning nonlinear operators via DeepONet" --format json

# 搜索论文（可读格式）
python skills/semantic-scholar/semantic_scholar_api.py paper-by-title "Learning nonlinear operators via DeepONet"
```

### 3. 保存为 metadata.json

```bash
# 保存论文数据到文件
python skills/semantic-scholar/semantic_scholar_api.py paper-by-arxiv "1910.03193" --format json > metadata.json
```

## 返回数据格式

### JSON 格式

```json
{
  "paperId": "5f8a7b3c2d1e4f6a9b8c7d6e5f4a3b2",
  "title": "Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators",
  "abstract": "We introduce DeepONet...",
  "authors": [
    {
      "authorId": "1234567890",
      "name": "Lu Lu"
    },
    {
      "authorId": "0987654321",
      "name": "Pengzhan Jin"
    }
  ],
  "year": 2019,
  "publicationDate": "2019-10-08",
  "venue": "Nature Machine Intelligence",
  "citationCount": 3144,
  "influentialCitationCount": 2156,
  "isOpenAccess": true,
  "openAccessPdf": {
    "url": "https://arxiv.org/pdf/1910.03193.pdf"
  },
  "fieldsOfStudy": [
    "Computer Science",
    "Mathematics"
  ],
  "s2FieldsOfStudy": [
    {
      "category": "Computer Science",
      "field": "Artificial Intelligence"
    }
  ]
}
```

### 可读格式

```
论文ID: 5f8a7b3c2d1e4f6a9b8c7d6e5f4a3b2
标题: Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators
作者: Lu Lu, Pengzhan Jin
发表时间: 2019-10-08
发表场所: Nature Machine Intelligence
引用数: 3144
影响力引用数: 2156
开放获取: 是
PDF链接: https://arxiv.org/pdf/1910.03193.pdf
```

## 重要字段说明

| 字段 | 用途 | 说明 |
|------|------|------|
| `paperId` | 论文唯一标识 | Semantic Scholar 的论文ID |
| `title` | 论文标题 | 完整标题 |
| `authors` | 作者信息 | 作者列表和ID |
| `year` | 发表年份 | 用于计算论文年龄 |
| `publicationDate` | 发表日期 | 用于 Date-Cition 计算 |
| `venue` | 发表场所 | 会议/期刊名称 |
| `citationCount` | 引用数量 | 用于影响力评分 |
| `influentialCitationCount` | 影响力引用数 | 更准确的引用指标 |
| `isOpenAccess` | 是否开放获取 | 判断是否有开放PDF |
| `openAccessPdf.url` | PDF链接 | 直接下载链接 |

## 使用场景

### 1. 论文评估时获取元数据

在论文评估流程中，使用 Semantic Scholar API 获取完整的元数据：

```python
import subprocess
import json

# 获取论文数据
result = subprocess.run([
    'python', 'skills/semantic-scholar/semantic_scholar_api.py',
    'paper-by-arxiv', '1910.03193',
    '--format', 'json'
], capture_output=True, text=True)

# 解析 JSON
metadata = json.loads(result.stdout)

# 提取所需字段
citation_count = metadata['citationCount']
publication_date = metadata['publicationDate']
authors = metadata['authors']
venue = metadata['venue']

# 保存为 metadata.json
with open('metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
```

### 2. 计算论文年龄和引用密度

```python
from datetime import datetime

# 从 metadata.json 读取数据
with open('metadata.json', 'r') as f:
    metadata = json.load(f)

# 计算论文年龄
publication_date = datetime.fromisoformat(metadata['publicationDate'])
current_date = datetime.now()
age_days = (current_date - publication_date).days
age_months = age_days / 30.44

# 计算引用密度
citation_count = metadata['citationCount']
citation_density = citation_count / age_months if age_months > 0 else 0

print(f"论文年龄: {age_months:.1f} 个月")
print(f"引用密度: {citation_density:.2f} 次/月")
```

### 3. Date-Cition 权衡计算

```python
# 计算调整因子
if age_months <= 3:
    adjustment_factor = 0.2  # 最新论文奖励
elif age_months <= 24:
    # 中期论文
    if citation_count >= 50:
        adjustment_factor = 0.5
    elif citation_count >= 20:
        adjustment_factor = 0.3
    elif citation_count >= 10:
        adjustment_factor = 0.2
    else:
        adjustment_factor = 0.1
else:
    # 成熟论文
    if citation_count >= 200:
        adjustment_factor = 0.5
    elif citation_count >= 100:
        adjustment_factor = 0.4
    elif citation_count >= 50:
        adjustment_factor = 0.3
    elif citation_count >= 20:
        adjustment_factor = 0.2
    else:
        adjustment_factor = 0.0

# 引用密度奖励
if citation_density >= 10:
    density_bonus = 0.2
elif citation_density >= 5:
    density_bonus = 0.1
else:
    density_bonus = 0.0

# 最终调整因子
final_adjustment = adjustment_factor + density_bonus
final_adjustment = min(final_adjustment, 1.0)  # 上限为1.0

print(f"Date-Cition 调整因子: {final_adjustment}")
```

## 注意事项

### 1. API 限制

- Semantic Scholar API 有请求频率限制
- 建议在请求之间添加延迟（建议 1 秒）
- 不要在短时间内发送大量请求

### 2. 数据准确性

- **arXiv ID 查询最准确**：优先使用 arXiv ID 查询
- **标题查询可能有误差**：标题相似或重复时可能返回错误结果
- **引用数更新延迟**：引用数可能不是最新的

### 3. 核心原则

> **Semantic Scholar 数据只允许调用一次。**
> 后续所有评分计算必须基于第一次获取的数据。
> 禁止在影响力计算阶段再次调用 API。

### 4. 错误处理

```python
import subprocess
import json

try:
    result = subprocess.run([
        'python', 'skills/semantic-scholar/semantic_scholar_api.py',
        'paper-by-arxiv', '1910.03193',
        '--format', 'json'
    ], capture_output=True, text=True, timeout=30)
    
    if result.returncode != 0:
        print(f"API 调用失败: {result.stderr}")
        # 处理错误
    
    metadata = json.loads(result.stdout)
    
except subprocess.TimeoutExpired:
    print("API 调用超时")
    # 处理超时
    
except json.JSONDecodeError:
    print("JSON 解析失败")
    # 处理解析错误
```

## 示例代码

### 完整的论文元数据获取流程

```python
import subprocess
import json
from datetime import datetime

def get_paper_metadata(arxiv_id):
    """获取论文元数据"""
    # 调用 API
    result = subprocess.run([
        'python', 'skills/semantic-scholar/semantic_scholar_api.py',
        'paper-by-arxiv', arxiv_id,
        '--format', 'json'
    ], capture_output=True, text=True, timeout=30)
    
    if result.returncode != 0:
        raise Exception(f"API 调用失败: {result.stderr}")
    
    # 解析 JSON
    metadata = json.loads(result.stdout)
    
    # 添加计算字段
    publication_date = datetime.fromisoformat(metadata['publicationDate'])
    current_date = datetime.now()
    age_days = (current_date - publication_date).days
    age_months = age_days / 30.44
    
    metadata['age_days'] = age_days
    metadata['age_months'] = age_months
    
    citation_count = metadata['citationCount']
    citation_density = citation_count / age_months if age_months > 0 else 0
    
    metadata['citation_density'] = citation_density
    
    return metadata

# 使用示例
metadata = get_paper_metadata("1910.03193")

# 保存为 metadata.json
with open('metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"论文标题: {metadata['title']}")
print(f"引用数: {metadata['citationCount']}")
print(f"论文年龄: {metadata['age_months']:.1f} 个月")
print(f"引用密度: {metadata['citation_density']:.2f} 次/月")
```

## 常见问题

### Q1: API 返回空结果

**原因**：
- arXiv ID 错误
- 论文未被 Semantic Scholar 收录
- 网络连接问题

**解决方案**：
- 检查 arXiv ID 格式（如：1910.03193）
- 尝试使用标题搜索
- 检查网络连接

### Q2: 引用数不准确

**原因**：
- Semantic Scholar 引用数更新有延迟
- 不同数据库的引用数可能不同

**解决方案**：
- 接受 Semantic Scholar 的引用数作为参考
- 如需更准确的引用数，可使用 Google Scholar（需要 SerpAPI）

### Q3: API 调用超时

**原因**：
- 网络连接慢
- API 服务器响应慢

**解决方案**：
- 增加超时时间
- 添加重试机制
- 检查网络连接