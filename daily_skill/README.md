# Daily Report Skill

> 从 Git commit 自动生成领导可读的工作日报，并基于已归档日报继续聚合周报、月报。

[![skills.sh](https://skills.sh/b/tyronczt/AI-Exploration)](https://skills.sh/tyronczt/AI-Exploration)
[![GitHub](https://img.shields.io/badge/GitHub-tyronczt%2FAI--Exploration-181717?logo=github)](https://github.com/tyronczt/AI-Exploration/tree/main/daily_skill)

这是一个面向 Claude Code / Codex 的工作报告 Skill。它会从一个或多个 Git 仓库中提取指定日期、指定作者的提交记录，将技术提交转换成业务语言，按故事线组织成日报；后续可以读取已保存的日报生成周报，再读取周报生成月报。

## 安装方式

在 Claude Code、Codex、OpenClaw 等支持 Skill 的 Agent 里，直接说：

```text
帮我安装这个 skill：https://github.com/tyronczt/AI-Exploration/tree/main/daily_skill
```

把链接换成你想装的 skill 目录，比如当前这个 `daily_skill`。Agent 会自己 clone 到对应目录，不用你操心路径。

也可以使用命令行安装：

```bash
npx skills add tyronczt/AI-Exploration/daily_skill
```

### 更新 Skill

如果本仓库里的 skill 有更新，可以在 Agent 里直接说：

```text
帮我更新这个 skill：https://github.com/tyronczt/AI-Exploration/tree/main/daily_skill
```

Agent 会重新拉取最新版本并覆盖本地旧版本。也可以重新执行安装命令来刷新：

```bash
npx skills add tyronczt/AI-Exploration/daily_skill
```

安装后可通过自然语言触发：

```text
帮我写今天的日报
帮我基于日报生成本周周报
帮我生成 2026-05 的月报
```

## 使用方式

安装后在 Claude Code 中通过以下方式触发：

| 模式 | 触发方式 | 输入来源 | 输出 |
|---|---|---|---|
| 日报 | `写日报`、`生成日报`、无明确模式时默认 | Git commit | `YYYY-MM-DD-工作日报.md` |
| 周报 | `写周报`、`生成周报` | 已保存的日报文件 | `YYYY-WXX-工作周报.md` |
| 月报 | `写月报`、`生成月报` | 已保存的周报文件 | `YYYY-MM-工作月报.md` |

## 能力

- **Git 提取**：按仓库路径、提交者邮箱、日期提取 commit，支持多个仓库合并分析。
- **噪音过滤**：自动跳过编译报错、格式调整、缩进、merge 等低价值提交。
- **语义分析**：优先使用 commit message + stat；遇到 `fix: bug`、`调整` 等模糊提交时再读取 diff。
- **业务化表达**：把技术动作改写成业务对象、改动内容、解决的问题和产生的价值。
- **故事线聚合**：按模块/业务目标组织内容，不按提交时间写流水账。
- **交互补全**：展示草稿后补充完成状态、协作上下文、待开发计划、风险阻塞等信息。
- **确认后归档**：日报确认完成并保存后，再询问是否提交到 Git 归档仓库，方便后续周报/月报复用。

## 日报流程

```text
收集输入
  仓库路径 / 提交者邮箱 / 日期
    ↓
提取 Git commit
    ↓
过滤噪音提交
    ↓
语义分析与业务语言转换
    ↓
按故事线生成草稿
    ↓
交互补全
  完成状态 / 协作上下文 / 待开发计划
    ↓
展示最终日报并确认完成
    ↓
保存本地目录
    ↓
可选提交 Git 归档仓库
```

## 周报与月报

周报不会重新扫描 Git commit，而是读取已经确认和保存的日报文件，再跨天合并故事线。月报同理，读取周报文件并跨周聚合。

这样做有两个好处：

- 日报里人工确认过的完成状态、协作上下文不会丢失。
- 周报/月报可以沿用日报的业务故事线，减少重复整理。

## 输出示例

```markdown
# 2026-05-15 工作日报

## 推广返佣模块功能完善
1. 推广返佣统计：优化返佣数据展示，补齐结算金额和待结算收益信息，提升返佣数据核对效率 *(已完成)*
2. 推广明细查询：完善推广用户订单与分润明细查看能力，提升推广收益追踪效率
3. 结算额度展示：统一返佣结算数据口径，保障累计结算和待结算金额展示准确

## 店铺与商品体验优化
1. 店铺详情页：优化店铺详情展示和商品区域联动体验，提升页面信息呈现稳定性
2. 多页面体验：统一商品详情、银行卡管理和推广统计等页面表现，提升用户操作一致性
```

## 归档仓库结构

如果选择提交到 Git 归档仓库，推荐保持以下目录结构：

```text
daily-report-repo/
├── daily/
│   ├── 2026-05-12-工作日报.md
│   ├── 2026-05-13-工作日报.md
│   └── ...
├── weekly/
│   ├── 2026-W20-工作周报.md
│   └── ...
└── monthly/
    ├── 2026-05-工作月报.md
    └── ...
```

## 配置项

| 配置 | 说明 | 默认值 |
|---|---|---|
| 仓库路径 | 支持逗号分隔多个 Git 仓库路径 | 交互式询问 |
| 提交者邮箱 | 用于匹配 Git author | 交互式询问 |
| 日期 | 日报目标日期 | 今天 |
| 日报存放目录 | 周报扫描的数据源目录 | 交互式询问 |
| 周报存放目录 | 月报扫描的数据源目录 | 交互式询问 |
| 归档仓库地址 | Git 远程仓库 URL | 交互式询问 |

## 适合场景

- 每天需要从多个项目仓库整理个人日报。
- Commit 偏技术化，希望输出更适合领导阅读。
- 希望周报/月报复用已确认日报，而不是月底重新回忆。
- 希望把日报、周报、月报沉淀到私有 Git 仓库中长期归档。

## 许可

本目录随 [tyronczt/AI-Exploration](https://github.com/tyronczt/AI-Exploration) 仓库发布。
