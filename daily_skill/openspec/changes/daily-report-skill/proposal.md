## Why

日常开发中，编写工作日报/周报/月报是一项重复但必要的工作。开发者需要从 git 提交记录中回顾当日工作，将其转化为领导可读的业务语言；周末需要汇总一周日报生成周报；月末需要汇总整月日报生成月报。手工整理耗时且容易遗漏，尤其在多仓库、多模块并行开发时更为明显。通过 Skill 自动化这一流程，可以从 commit 历史中智能提取、语义升维、按故事线聚合，大幅降低日报/周报/月报编写成本。

## What Changes

- 新增 Claude Code Skill `daily-report`，支持从一个或多个 git 仓库中提取指定作者、指定日期的 commit 记录
- 自适应语义分析：先读 commit message + stat，对无法理解的 commit 深入读 diff 内容
- 自动过滤噪音 commit（编译报错、格式调整等无业务价值的提交）
- 按"故事线"聚合 commit，产出业务语言描述（非流水账）
- 交互式补全：询问完成状态、协作上下文、待开发计划
- 输出 Markdown 格式日报，适配领导阅读场景
- 支持变量配置：仓库路径（多仓库）、提交者邮箱、日期
- 新增周报生成功能：从指定目录读取一周的日报文件，按故事线跨日聚合，生成周报摘要
- 新增月报生成功能：从指定目录读取一月的周报文件，按故事线跨周聚合，生成月报摘要
- 周报/月报交互式补全：询问整体进展、下阶段计划、风险与阻塞项
- 可选：日报确认完成并处理本地保存后提交至私有 Git 仓库进行归档，方便后续周报/月报输出；周报/月报生成后也可上传归档（仓库地址通过变量配置）

## Capabilities

### New Capabilities
- `git-commit-extraction`: 从 git 仓库提取指定作者和日期的 commit 记录，支持多仓库、噪音过滤
- `semantic-analysis`: 对 commit 进行自适应语义分析，从 message/stat/diff 中提取业务含义
- `storyline-aggregation`: 将 commit 按业务故事线聚合，生成标题和编号点列表
- `interactive-completion`: 交互式询问完成状态、协作上下文、待开发计划，补全日报信息
- `report-generation`: 输出 Markdown 格式日报，适配领导阅读
- `weekly-report-generation`: 从指定目录读取一周日报文件，跨日聚合故事线，生成周报摘要
- `monthly-report-generation`: 从指定目录读取一月周报文件，跨周聚合故事线，生成月报摘要
- `remote-archive`: 可选，将日报/周报/月报上传至私有 Git 仓库进行归档

### Modified Capabilities

（无已有 capability 需修改）

## Impact

- 新增 `.claude/skills/daily-report/SKILL.md` Skill 定义文件
- 依赖 `git` 命令行工具（已预装）
- 依赖 Claude Code 的 LLM 能力进行语义分析和故事线聚合
- 无外部 API 依赖，无数据库依赖
- 周报功能依赖日报文件的存储，月报功能依赖周报文件的存储，需用户配置文件存放目录
- 远程归档功能依赖 Git 仓库访问权限，需用户预先配置 git 凭证
