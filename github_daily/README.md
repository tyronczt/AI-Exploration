# GitHub 一周热点

每周自动获取 GitHub 热门开源项目，生成包含中文摘要、星标趋势图的精美 HTML 周报。

## 文件说明

| 文件 | 用途 |
|------|------|
| `SKILL.md` | QoderWork 技能定义文件，包含完整的工作流程和指令 |
| `template.html` | HTML 报告模板，含样式和交互逻辑 |
| `github-trending-YYYY-MM-DD.html` | 每次生成的周报文件 |

## 使用方式

在 QoderWork 中调用 `github-trending` 技能，或手动输入类似指令：

- "获取本周 GitHub 热门项目"
- "生成 GitHub 周报"
- "看看最近 GitHub 上什么项目最火"

技能会自动抓取 GitHub Trending 数据，为每个项目生成中文深度介绍，并输出为可视化 HTML 页面。

## 周报内容

每个项目包含：

- 一句话概括（是什么 + 核心特点 + 适合谁）
- 2-3 段博客风格的中文详细介绍
- 最近 7 天星标增长趋势图（基于 Chart.js）
- 项目基础数据：Star 数、Fork 数、编程语言
- 可点击的项目链接直接跳转 GitHub

## 定时更新

可配合 QoderWork 的定时任务功能，设置每天自动运行，实现每日/每周自动推送。
