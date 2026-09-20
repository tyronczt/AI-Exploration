# AI-Exploration

> **AI 探索：将一时迸发的灵感或小需求，用 AI 编程工具（Cursor、Trae 等等）来完成，后期有另外的想法可再添加！~**

---

## 项目列表

### 1. 语雀一键复制公众号

Chrome 浏览器插件，一键将语雀文章复制到微信公众号编辑器，保留样式和图片。

**技术栈**：Chrome Extension (Manifest V3)、JavaScript

📂 [yuque/](https://github.com/tyronczt/AI-Exploration/tree/main/yuque)

### 2. 词小伴 — 英语单词记忆小程序

面向英语辅导机构学生的背单词微信小程序，支持词库管理、收藏、学习记录和统计分析。

**技术栈**：微信小程序 + Vue 3 管理后台 + Spring Boot + MySQL

📂 [wordcard/](https://github.com/tyronczt/AI-Exploration/tree/main/wordcard)

### 3. 地铁通勤打卡

地铁打卡记录微信小程序，支持打卡、日历视图、数据统计分析和成就系统。

**技术栈**：微信小程序 + Node.js/Express + MySQL

📂 [subway_records/](https://github.com/tyronczt/AI-Exploration/tree/main/subway_records)

### 4. 周末旅行出游

周末短途旅行规划系统，可解析文章/视频链接自动生成旅行行程，集成高德地图和 AI 能力。

**技术栈**：Vue 3 + Spring Boot + Spring AI Alibaba + MySQL + Redis（规划中）

📂 [travel_partner/](https://github.com/tyronczt/AI-Exploration/tree/main/travel_partner)

### 5. L 站邀请码管理系统

Linux.do 邀请码申请与管理系统，支持用户提交申请、管理员审核和分配邀请码。

**技术栈**：Node.js + Express + MySQL

🔗 在线地址：[https://tyron.me/linuxdo_invite/](https://tyron.me/linuxdo_invite/)

📂 [linuxdo_invite/](https://github.com/tyronczt/AI-Exploration/tree/main/linuxdo_invite)

### 6. 工作日报/周报/月报生成 Skill

AI Agent Skill，从 Git commit 记录自动生成业务化工作日报，并可逐级聚合为周报和月报。

**技术栈**：SKILL.md（Agent Skill 定义）

```bash
npx skills add tyronczt/AI-Exploration/daily_skill
```

[![skills.sh](https://skills.sh/b/tyronczt/AI-Exploration)](https://skills.sh/tyronczt/AI-Exploration)

📂 [daily_skill/](https://github.com/tyronczt/AI-Exploration/tree/main/daily_skill)

### 7. GitHub 热点项目周报 Skill

AI Agent Skill，自动抓取 GitHub 本周热门项目，生成包含中文深度介绍、星标趋势图的精美 HTML 周报。

~~🔗 在线地址：<https://10130728.xyz/github_daily/index.html>~~

**技术栈**：SKILL.md + HTML 模板 + Chart.js

```bash
npx skills add tyronczt/AI-Exploration/github_daily
```

📂 [github_daily/](https://github.com/tyronczt/AI-Exploration/tree/main/github_daily)

### 8. AI × GitHub 融合日报 Skill

AI Agent Skill，将 AI HOT 每日资讯与 GitHub Trending 热门项目融合为单文件 HTML 晨报，附带日历浏览和趋势看板。支持增量构建、暗色主题和移动端适配。

**技术栈**：SKILL.md + HTML/CSS/JS 单文件 + Node.js 构建脚本

🔗 在线地址：<https://10130728.xyz/ai-fusion-daily/index.html>

```bash
npx skills add tyronczt/AI-Exploration/ai-fusion-daily
```

[![skills.sh](https://skills.sh/b/tyronczt/AI-Exploration/ai-fusion-daily)](https://skills.sh/tyronczt/AI-Exploration/ai-fusion-daily)

📂 [ai-fusion-daily/](https://github.com/tyronczt/AI-Exploration/tree/main/ai-fusion-daily)

### 9. 小天视觉内容 Skill

AI Agent Skill，结合统一的小天 Agent 形象，提供知识全景图、文章配图、小红书图文和动画视频四个能力。按内容选择图形结构，保持温暖手绘品牌风格。

**交付**：一张知识全景图 / 网站机制配图 / 小红书章节图文 / 实际动画视频。

**技术栈**：SKILL.md + 四类能力指南 + 共用角色规范与图像参考

下载一个完整技能目录即可使用全部能力；实际生成需要宿主具备相应的图像或视频工具。安装与使用方式见 [技能 README](xiaotian-visual/README.md)。

📂 [xiaotian-visual/](https://github.com/tyronczt/AI-Exploration/tree/main/xiaotian-visual)
