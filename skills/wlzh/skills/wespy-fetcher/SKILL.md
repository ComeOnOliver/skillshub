# WeSpy Fetcher

封装 [tianchangNorth/WeSpy](https://github.com/tianchangNorth/WeSpy) 的完整能力。

## 功能范围（与 WeSpy 对齐）

- 单篇文章抓取（微信公众号 / 通用网页 / 掘金）
- 微信专辑文章列表获取（`--album-only`）
- 微信专辑批量下载（`--max-articles`）
- 多格式输出（Markdown 默认，支持 HTML / JSON / 全部）
- 交互模式（不传 URL 时）

## 依赖来源

- 上游项目：`https://github.com/tianchangNorth/WeSpy`
- 本地约定克隆目录：`~/Documents/QNSZ/project/WeSpy`

## 使用

脚本位置：`scripts/wespy_cli.py`

```bash
# 查看帮助
python3 scripts/wespy_cli.py --help

# 单篇文章（默认输出 markdown）
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/s/xxxxx"

# 输出 markdown + html
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/s/xxxxx" --html

# 输出 markdown + json
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/s/xxxxx" --json

# 输出所有格式
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/s/xxxxx" --all

# 专辑只拉列表
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/mp/appmsgalbum?..." --album-only --max-articles 20

# 专辑批量下载
python3 scripts/wespy_cli.py "https://mp.weixin.qq.com/mp/appmsgalbum?..." --max-articles 20 --all
```

## 参数

透传 WeSpy 原生命令参数：

- `url`
- `-o, --output`
- `-v, --verbose`
- `--html`
- `--json`
- `--all`
- `--max-articles`
- `--album-only`

## 实现说明

- 优先使用本地源码路径 `~/Documents/QNSZ/project/WeSpy`
- 若本地不存在则自动执行 `git clone` 到该目录
- 通过导入 `wespy.main.main` 直接调用上游 CLI，保持行为一致
