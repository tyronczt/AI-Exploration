# AI Fusion Daily Skill

`ai-fusion-daily` 用于生成「AI HOT 日报 + GitHub Trending」融合日报，并维护首页的日历浏览和趋势看板。

完整规范见 [SKILL.md](SKILL.md)，问题排查见 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)。

## 产物结构

```text
ai-fusion-daily/
├── SKILL.md          # 权威规范
├── README.md         # 本文件
├── index.html        # 总入口：日历 + 趋势看板
├── build.js          # 构建入口（wrapper）
├── YYYYMMDD.html     # 单日融合日报
├── scripts/
│   └── build-fusion-index.js
└── agents/
    └── openai.yaml
```

## 快速使用

```text
使用 $ai-fusion-daily 生成今天的融合日报
```

## 构建索引

```bash
node build.js
```

支持增量构建，未修改的日报自动复用缓存。

## 依赖

- `aihot` skill（AI 日报数据源）
- Node.js（构建脚本）
- 网络访问（GitHub Trending）
