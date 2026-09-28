# Java 团队规范与多中台代码审查

把 Java 开发规范、项目级智能体规则和代码审查 Skill 一起安装到项目中。支持 Codex、Claude Code、Cursor、WorkBuddy/CodeBuddy，所有入口共用一份规范和审查流程。

维护者只维护这个目录；同事下载后运行一条安装命令，无需分别复制多个智能体配置。

## 快速安装

需要 Python 3.10+，安装脚本仅使用标准库，不需要 pip、Node.js 或额外依赖。

1. [下载 java-team-standards.zip](https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/java-team-standards.zip)，安装包只包含本目录的五个源文件，无需克隆整个仓库，也不需要安装 Git。
2. 解压后，在包含 `java-team-standards` 文件夹的目录打开终端。
3. 执行安装命令，把目标替换为已经存在的项目根目录。Windows 路径含空格时保留引号；macOS/Linux 可将 `python` 换为 `python3`。

```bash
python java-team-standards/install.py --target "目标项目根目录"
```

如果解压工具额外生成了一层同名文件夹，先进入该层；也可以进入包含 `install.py` 的目录，执行 `python install.py --target "目标项目根目录"`。

默认生成四类工具需要的入口。只使用部分工具时可以缩小范围：

```bash
python java-team-standards/install.py --target "目标项目根目录" --agents codex cursor
```

安装前预览、不写入：

```bash
python java-team-standards/install.py --target "目标项目根目录" --dry-run
```

脚本不创建 Java 工程，不安装构建插件，不访问网络，不改个人全局配置，不执行 Git 提交或推送。

## 会写入什么

| 目标项目位置 | 作用 |
| --- | --- |
| AGENTS.md | 项目开发规则的受管区块，保留已有内容 |
| .agents/skills/multi-center-code-review/ | 主 Skill、自带规范及安装状态 |
| CLAUDE.md、.claude/skills/ | Claude Code 导入与技能入口，仅选择该工具时生成 |
| .codebuddy/CODEBUDDY.md、.codebuddy/skills/ | WorkBuddy/CodeBuddy 入口，仅选择该工具时生成 |

Cursor 原生使用 AGENTS.md 和 .agents/skills，无需专用副本。工具要求的兼容文件仍会存在，但由安装器生成，同事不需要逐个维护。使用 --agents 缩小范围不会删除以前安装的其他入口。

已有规则与包内基线冲突时，以目标项目已确认的业务契约和明确约定为准，需说明差异。本包采用 Query/VO 边界等团队约定；账户、支付、结算是按需采用的专项，不要求每个项目都实现。

## 更新与保护机制

获取新版安装包后执行：

```bash
python java-team-standards/install.py --target "目标项目根目录" --update --dry-run
python java-team-standards/install.py --target "目标项目根目录" --update
```

- 重复执行相同版本不产生重复区块，内容未变的文件不重写。
- AGENTS.md、CLAUDE.md 和 CODEBUDDY.md 只更新受管标记之间的内容；区块外的项目规则和个人编辑保留。
- 新版替换旧版必须显式 --update，且旧内容必须与上次安装记录一致。手工改过受管区块或技能文件时停止并列出冲突，不提供强制覆盖选项。
- 首次遇到同名但内容不同的 Skill 时也停止，不把已有技能当作本包资产。
- 修改团队基线应改本包；项目补充放受管区块外。不要编辑安装状态来强行跳过冲突检查。
- 写入前先检查全部目标。写入中出错会尝试恢复已写文件；检测到并发编辑时保留编辑并报告，不能保证与其他写入进程共同形成原子事务。安装时请暂停同目录的其他修改。
- 目标文件及父目录的符号链接/目录联接不自动处理。存在非空 AGENTS.override.md 时先人工整合，避免安装后的 AGENTS.md 被忽略。
- 不自动删除任何既有入口。卸载时只移除本包受管区块与确认未手改的安装文件，保留其他项目配置。

建议将安装结果纳入目标项目自身的变更评审与版本管理。安装脚本不会替你提交。

## 如何使用

正常开发直接描述需求；项目规则负责引导智能体读取相关规范。

Codex 审查示例：

```text
$multi-center-code-review 审查当前未提交的 Java 变更，只输出有证据的问题和验证边界，不修改代码。
```

Claude Code 使用 /multi-center-code-review；Cursor 从 / 菜单选择对应技能。WorkBuddy/CodeBuddy 在目标代码项目中选择技能或要求“使用 multi-center-code-review 审查指定变更”。没有自动发现时，显式让智能体读取项目 AGENTS.md 与主 Skill。

首次安装后新建项目会话，检查规则/技能列表，再让智能体说明实际读取的规范、审查范围和入口。配置检查通过不等于各客户端均已实测加载；旧版本、项目信任及组织策略可能改变发现行为。

### 只需要审查 Skill

Skill 自带 [完整规范](multi-center-code-review/references/standards.md)，可以单独复制或通过标准技能安装工具安装。也可执行：

```bash
npx skills add https://github.com/tyronczt/AI-Exploration/tree/main/java-team-standards/multi-center-code-review --copy
```

根据提示选择项目范围和目标工具。这个方式只安装 Skill，不创建项目 AGENTS.md，也不会自动启用日常开发规则。完整接入优先使用上面的 Python 安装器。标准 CLI 的来源格式和复制选项见 [skills 官方说明](https://github.com/vercel-labs/skills)。

## 维护者只需关注五个文件

```text
java-team-standards/
├── README.md
├── install.py
├── rules.md
└── multi-center-code-review/
    ├── SKILL.md
    └── references/standards.md
```

[rules.md](rules.md) 是开发基线，[SKILL.md](multi-center-code-review/SKILL.md) 是审查流程，[standards.md](multi-center-code-review/references/standards.md) 是详细规范。兼容入口在安装时生成，不维护多份业务正文。

规范参考阿里、Google、AWS、Microsoft 的官方资料，具体链接和适配边界见完整规范。没有捆绑第三方项目源码或整本开发手册。

工具入口依据：[Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)、[Codex Skills](https://developers.openai.com/codex/skills)、[Claude Code 记忆](https://code.claude.com/docs/en/memory)、[Claude Code Skills](https://code.claude.com/docs/en/skills)、[Cursor Rules](https://cursor.com/docs/rules)、[Cursor Skills](https://cursor.com/docs/skills)、[WorkBuddy 项目配置](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Project)。核验日期：2026-09-28。

### 维护下载包

`java-team-standards.zip` 是上述五个源文件的分发副本，内部保留 `java-team-standards/` 顶层目录。规范或安装器变更后，需要重新打包并与源码一起提交；不要把安装结果、测试文件、缓存或 ZIP 本身打入安装包。

在仓库根目录执行（Python 3.10+）：

```bash
python -c "from pathlib import Path; from zipfile import ZipFile, ZIP_DEFLATED; p=Path('java-team-standards'); files=['README.md','install.py','rules.md','multi-center-code-review/SKILL.md','multi-center-code-review/references/standards.md']; z=ZipFile(p/'java-team-standards.zip','w',ZIP_DEFLATED); [z.write(p/f,(p/f).as_posix()) for f in files]; z.close()"
```
