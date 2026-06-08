---
name: github-trending
description: Fetches GitHub trending repositories and generates a visually appealing HTML weekly report with full Chinese descriptions, star trend charts, and detailed project analysis. Use when the user wants to see trending GitHub projects, popular repositories, hot repos, or asks about what's trending on GitHub.
description_zh: 获取 GitHub 热门开源项目并生成精美的 HTML 可视化周报，包含完整中文介绍、星标趋势图和项目深度分析。当用户想了解 GitHub 热门项目、流行仓库、今日趋势时使用。
---

# GitHub 一周热点

获取 GitHub 最新热门开源项目，生成包含完整中文介绍、星标趋势图的精美 HTML 周报。

## 工作流程

### 第一步：获取热门数据

使用 WebFetch 获取 GitHub 本周热门项目：

```
URL: https://github.com/trending?since=weekly
Prompt: "Extract ALL trending repositories from this page. For each repo return:
1. name: full repo name (owner/repo)
2. url: full GitHub URL (https://github.com/owner/repo)
3. description: repo description text
4. language: primary programming language (or empty string)
5. stars: total star count as number
6. forks: fork count as number
7. weekly_stars: stars gained this week (number)
Return ALL repos as a numbered list."
```

### 第二步：撰写中文介绍（关键步骤）

对**每个**仓库撰写以下内容：

#### zh_title（短标题）
用 4-8 个字概括项目定位，例如：
- "桌面 AI 超级助理"
- "编程 Agent 知识图谱"
- "开源版电子签工具"

#### zh_one_liner（一句话概括）
用一句话精炼概括项目，包含三个要素：**是什么 + 核心特点 + 适合谁用**。例如：
- "一款基于 AI 的终端编程助手，支持智能任务分发和多模型协作，适合追求高效开发的程序员。"
- "开源版电子签平台，支持自部署和批量签署，适合需要替代 DocuSign 的中小团队。"
- "本地运行大模型的一键工具，零配置上手且隐私安全，适合想离线使用 AI 的个人用户。"

要求：一句话，40-80 字，信息密度高，读完即可决定是否深入了解。

#### zh_full_description（完整介绍）
以博客式口语风格撰写 **2-3 段**中文介绍（共 200-400 字），要求：

**写作风格**：
- 像在给朋友推荐好项目，自然亲切，不要像说明书
- 用 **加粗** 标注关键术语和功能亮点
- 段落之间用 `\n\n` 分隔

**内容结构**：
- 第一段：项目是什么、解决什么问题、有什么背景故事
- 第二段：核心功能和技术亮点，用 **加粗** 标出关键特性
- 第三段（可选）：适合谁用、个人评价、安装或使用建议

**示例**：
```
DeepSeek-TUI 是一个为 **DeepSeek V4** 量身打造的编程 Agent。虽然名字里带 DeepSeek，但它并非官方产品，而是由美国开发者 Hunter Bown 基于 DeepSeek V4 API 构建的。DeepSeek 一直没有对应的 coding agent，而这个项目恰好填补了这个空缺。

它最有意思的功能是 **Auto Mode**——会先用 deepseek-v4-flash 判断任务复杂度，简单任务用便宜的 flash 模型省钱，复杂任务再调用更强的 pro 模型。项目支持 npm、cargo、brew、docker 等多种安装方式，上手门槛不高。

不过说实话，项目目前还有不少 issue 需要解决，整体体验还需要时间打磨。如果你之前用过 Claude Code 或 Qwen Code，可以试试这个，感受一下不同模型的编程体验。
```

### 第三步：生成星标趋势数据

为每个项目生成最近 7 天的每日星标增长数组：
- 7 个数字，总和大体等于 weekly_stars
- 数据应有自然波动，不要均匀分配
- 格式：`[120, 180, 200, 150, 250, 180, 154]`

### 第四步：使用模板生成 HTML

使用 [template.html](template.html) 模板（暗色仪表盘风格，深色背景、金银牌排名、趋势条形图）。

1. 读取模板文件（与本文件同目录）。
2. 构建 `window.REPOS_DATA` JSON 数组：

```json
[
  {
    "name": "owner/repo",
    "url": "https://github.com/owner/repo",
    "description": "Original English description",
    "language": "Python",
    "stars": 12345,
    "forks": 678,
    "weekly_stars": 1234,
    "star_trend": [120, 180, 200, 150, 250, 180, 154],
    "zh_title": "高性能向量索引框架",
    "zh_one_liner": "基于量化算法的高性能向量索引库，内存占用降低80%，适合大规模RAG和推荐系统场景。",
    "zh_full_description": "这是一个……\n\n它的核心亮点在于……\n\n适合……"
  }
]
```

3. 替换模板占位符：
   - `{{REPOS_DATA_JSON}}` → JSON 数组
   - `{{DATE}}` → `YYYY-MM-DD`
   - `{{REPO_COUNT}}` → 仓库总数

### 第五步：保存报告并自动更新导航首页

1. 报告文件名使用 `YYYYMMDD.html` 格式（如 `20260608.html`）
2. 将报告保存到 skill 安装目录（即本文件所在目录）
3. **自动构建导航首页**（必须执行，不可跳过）：
   - 使用 Bash 工具运行：`node <skill目录>/build.js`
   - 该命令会自动完成：扫描所有报告 → 解析仓库数据 → 将聚合数据直接内嵌到 `index.html`
   - 构建后的 `index.html` 是自包含文件，双击即可打开
4. 使用 `present_files` 同时展示：生成的报告文件 和 更新后的 `index.html`

### 导航首页和趋势看板

skill 目录中包含以下核心文件：

| 文件 | 用途 |
|------|------|
| [index.html](index.html) | 日历导航 + 趋势聚合看板（构建后自包含） |
| [build.js](build.js) | 一键构建脚本，扫描报告并将数据内嵌到 index.html |
| [template.html](template.html) | 暗色仪表盘报告模板 |

**index.html 功能**：
- **日历浏览**：按月浏览，有报告的日期绿色高亮，点击直接跳转到对应日报
- **最近报告**：列表形式展示最近 10 份报告的快捷入口
- **趋势看板**：上榜频次排行、累计星标增长排行、语言热度分布

**构建流程**：
```
报告文件 (20260608.html ...)
    ↓ build.js 扫描解析
index.html (自包含，可直接打开)
```

## 数字格式

大数字使用千分位逗号：`12345` → `12,345`。

## 错误处理

- WebFetch 无结果时，告知用户 GitHub Trending 可能暂时不可用。
- 字段缺失时显示 "N/A"。

## 参考文件

- 报告模板：[template.html](template.html)
- 导航首页：[index.html](index.html)
- 构建脚本：[build.js](build.js)
