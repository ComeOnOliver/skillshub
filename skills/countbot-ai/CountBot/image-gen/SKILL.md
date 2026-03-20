# AI 图片生成

基于 ModelScope API 的文生图工具，支持异步生成、LoRA 风格叠加。

## 配置

编辑 `skills/image-gen/scripts/config.json`：

```json
{
  "api_token": "YOUR_MODELSCOPE_TOKEN"
}
```

Token 获取：[ModelScope 控制台](https://modelscope.cn/my/myaccesstoken) 创建 Access Token。

## 命令行调用

```bash
# 基础文生图
python3 skills/image-gen/scripts/generate.py generate --prompt "一只金色的猫"

# 指定输出路径
python3 skills/image-gen/scripts/generate.py generate --prompt "赛博朋克城市" --output cyberpunk.jpg

# 指定模型
python3 skills/image-gen/scripts/generate.py generate --prompt "水墨山水画" --model Tongyi-MAI/Z-Image-Turbo

# 使用 LoRA 风格
python3 skills/image-gen/scripts/generate.py generate --prompt "一个女孩" --lora "repo-id/lora-model"

# 多 LoRA 叠加（JSON 格式，权重之和为 1.0）
python3 skills/image-gen/scripts/generate.py generate --prompt "风景画" --lora '{"lora1": 0.6, "lora2": 0.4}'

# 指定尺寸
python3 skills/image-gen/scripts/generate.py generate --prompt "壁纸" --size 1920x1080

# 查询任务状态
python3 skills/image-gen/scripts/generate.py status --task-id TASK_ID

# JSON 格式输出
python3 skills/image-gen/scripts/generate.py generate --prompt "猫" --json
```

## AI 调用流程

### 步骤 1：生成图片

根据用户描述构造英文 prompt（英文效果更好），调用脚本生成图片并保存到本地：

```bash
python3 skills/image-gen/scripts/generate.py generate --prompt "A cute golden cat, high quality, detailed fur, studio lighting" --output data/temp/images/golden_cat.jpg
```

### 步骤 2：发送到频道（自动联动 send_media）

图片生成成功后，如果当前是频道会话（飞书/QQ/钉钉/Telegram 等），必须使用内置工具 `send_media` 将图片发送给用户：

```
send_media(file_paths=["data/temp/images/golden_cat.jpg"], message="已为你生成图片 🎨")
```

如果是网页会话，直接告知用户图片保存路径即可。

### 完整示例

用户说"帮我画一只猫"：

1. 执行生成：
```bash
python3 skills/image-gen/scripts/generate.py generate --prompt "A cute golden cat, high quality, detailed fur" --output data/temp/images/cat.jpg
```

2. 发送到频道：
```
send_media(file_paths=["data/temp/images/cat.jpg"], message="🎨 已生成图片：一只金色的猫")
```

用户说"画一张赛博朋克风格的城市壁纸"：

1. 执行生成：
```bash
python3 skills/image-gen/scripts/generate.py generate --prompt "Cyberpunk city skyline, neon lights, rain, cinematic, 4K" --output data/temp/images/cyberpunk.jpg --size 1920x1080
```

2. 发送到频道：
```
send_media(file_paths=["data/temp/images/cyberpunk.jpg"], message="🎨 赛博朋克城市壁纸")
```

## 支持的模型

| 模型 | 说明 |
|------|------|
| `Tongyi-MAI/Z-Image-Turbo` | 默认，通义万相快速生成 |

可通过 `--model` 参数指定 ModelScope 上其他文生图模型。

## Prompt 技巧

- 使用英文 prompt 效果更好
- 加入质量描述词：`high quality`, `detailed`, `4K`, `studio lighting`
- 加入风格描述：`oil painting`, `watercolor`, `anime style`, `photorealistic`
- 加入构图描述：`close-up`, `wide angle`, `bird's eye view`
- 负面描述可以在 prompt 中用 `no xxx` 表达

## 注意事项

- 异步生成，脚本会自动轮询直到完成（默认超时 5 分钟）
- 生成的图片建议保存到 `data/temp/images/` 目录
- LoRA 最多叠加 6 个，权重之和必须为 1.0
- 频道会话中生成图片后务必调用 `send_media` 发送，不要只返回文件路径