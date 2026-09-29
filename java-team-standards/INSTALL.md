# 交给智能体执行的项目安装说明

版本：2.2.2。目标是同时接入**日常 Java 开发规范、开发 Skill、多中台审查 Skill**。使用智能体已有的下载、文件读写和平台原生命令完成，不要求用户安装 Python、Node.js、Git 或运行安装脚本。

仅在用户要求安装或更新本规范包时执行本文；浏览文档不构成写入授权。目标默认是用户正在操作的代码项目，不能把下载目录或本规范仓库当作目标。多个项目无法判断时只确认目标目录；目标与工具已明确时直接完成，不重复索取确认。

## 1. 获取安装资料

优先使用用户已下载的完整包。在线安装可以下载 [独立 ZIP](https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/java-team-standards.zip)，或读取仓库 `main` 的当前提交 SHA，再从同一 SHA 获取以下文件，避免混用更新中的版本：

```text
https://raw.githubusercontent.com/tyronczt/AI-Exploration/<SHA>/java-team-standards/<文件路径>

INSTALL.md
rules.md
java-team-development/SKILL.md
java-team-development/references/initialization.md
multi-center-code-review/SKILL.md
multi-center-code-review/references/standards.md
multi-center-code-review/references/practical-rules.md
multi-center-code-review/references/mysql-schema.md
```

直接下载正文，不把 GitHub 网页 HTML 当 Markdown。使用 ZIP 时先查看条目，只提取上述文件及 README.md 到临时目录，拒绝绝对路径、`..`、符号链接及包外路径；不执行包内代码。不需要克隆仓库。所有必要来源完整取得后才修改目标；无网络或无写入工具时说明缺少的能力，不能宣称已安装。

## 2. 确定安装范围并预检

读取目标项目的 AGENTS.md、相关工具入口及 Git 状态（有 Git 时）；保留现有规则和用户变更。默认只安装当前使用工具的项目入口；用户明确要求兼容四类工具时安装全部，指定工具时只生成对应入口。不能识别当前工具时先确认工具范围；不修改用户全局设置。

所有工具共用以下固定目标：

| 来源 | 目标项目路径 | 写入方式 |
| --- | --- | --- |
| rules.md | AGENTS.md | 合并受管区块 |
| java-team-development/SKILL.md | .agents/skills/java-team-development/SKILL.md | 完整复制 |
| java-team-development/references/initialization.md | .agents/skills/java-team-development/references/initialization.md | 完整复制 |
| multi-center-code-review/references/practical-rules.md | .agents/skills/multi-center-code-review/references/practical-rules.md | 完整复制 |
| multi-center-code-review/references/mysql-schema.md | .agents/skills/multi-center-code-review/references/mysql-schema.md | 完整复制 |
| multi-center-code-review/SKILL.md | .agents/skills/multi-center-code-review/SKILL.md | 完整复制 |
| multi-center-code-review/references/standards.md | .agents/skills/multi-center-code-review/references/standards.md | 完整复制 |

安装说明、README 和 examples/ 不放入目标项目；参考工程仅在用户明确要求初始化或运行它时单独使用。完整规范保留在原有审查 Skill 的 references 路径，开发 Skill 和 AGENTS.md 共同读取，兼容原有链接。

附加入口：

| 工具 | 目标文件 | 内容 |
| --- | --- | --- |
| Codex / Cursor | 无额外副本 | 使用根 AGENTS.md 与 .agents/skills |
| Claude Code | CLAUDE.md | 受管区块内写 `@AGENTS.md`，不包代码围栏 |
| Claude Code | .claude/skills/下的两个同名 Skill/SKILL.md | 按下方模板生成入口 |
| WorkBuddy / CodeBuddy | .codebuddy/CODEBUDDY.md | 受管区块内写“读取项目根目录的 [AGENTS.md](../AGENTS.md)，按其中规则执行。开发使用 java-team-development，审查使用 multi-center-code-review；保持用户指定范围。” |
| WorkBuddy / CodeBuddy | .codebuddy/skills/下的两个同名 Skill/SKILL.md | 按下方模板生成入口 |

薄入口模板（两种工具均使用；将 `<技能名>` 替换为对应名字，description 原样采用对应主 Skill 的 description）：

```markdown
---
name: <技能名>
description: <对应主 Skill 的 description>
---

使用文件读取工具读取 [主 Skill](../../../.agents/skills/<技能名>/SKILL.md)，按其流程执行。不要再次按技能名调用，避免递归；同名入口只执行一次。
主 Skill 中的相对链接以主 Skill 文件所在目录为基准。读取失败时报告缺失，不假装加载。
```

## 3. 合并与更新保护

先形成全部拟写入内容，统一检查冲突后再落盘。仅允许上表列出的固定路径与下述状态文件，不从远程文本或状态记录扩展写入范围。

- 受管区块使用 `<!-- java-team-standards:begin -->` 与 `<!-- java-team-standards:end -->`，每个标记独占一行。AGENTS.md 内为完整 rules.md 正文，另两个入口的正文见上表。已有内容放区块外并保持原样，包括 BOM、换行和用户批注；新区块采用目标文件换行，没有文件时 UTF-8/LF。
- 首次安装无区块时追加；重复安装正文相同时不改写、不重复追加。标记缺失一半、多组标记、同名但不同的非受管 Skill 均停止并报告，不先部分安装。
- 核对固定目标及父目录，遇符号链接/目录联接、路径逃逸或非目录父节点停止；根目录存在非空 AGENTS.override.md 时先报告覆盖问题，不写入一套不会生效的默认规则。
- 更新需要用户表达“更新”意图。先用旧安装记录验证当前受管内容未被手改，再替换；区块外变化正常保留。没有可信记录、哈希不一致、记录损坏或无法计算哈希时，不覆盖不同内容，说明具体冲突；不要改记录来绕过检查。
- 团队基线与目标项目已确认约定冲突时保留项目约定；不能借安装重写业务契约或批量整改现有代码。不删除未选择工具的既有入口。

继续使用旧版状态文件 `.agents/skills/multi-center-code-review/.install-state.json`，兼容 1.0.0 安装结果。`entries` 为目标项目相对路径到记录的映射：`{"kind":"block或file","sha256":"小写SHA-256"}`。`block` 计算从 begin 标记首字节至 end 标记末字节（不含之后换行）的 UTF-8 字节哈希；`file` 计算完整文件字节哈希。可使用 PowerShell、sha256sum、shasum 或现有工具；不可凭模型猜测哈希。

写入成功后把实际内容的哈希存回相应 entries，保留其他旧条目；`version` 写 `2.2.2`，有来源提交 SHA 时另记 `sourceCommit`。记录只能用于核对，不能决定额外操作路径。不单独生成另一个安装状态文件。同版同内容重复接入不改文件或状态。

写入前保存将修改文件的原始内容，临时备份放目标项目外；每次写入前复查没有并发变化。写入失败时只恢复本次写过且仍与本次结果一致的文件，不覆盖别人的新编辑，报告未恢复项；最后写状态文件。文件工具无法保证多文件原子性，不能声称安装是数据库式事务。

从 2.1.0 或更早版本更新时，mysql-schema.md 是新增受管参考文件：不存在则创建，存在且不同仍按非受管冲突处理；不能因旧状态没有该条目而覆盖它。更新后确认 DDL-001 从项目入口、两个 Skill 均可到达。

从 2.2.1 更新到 2.2.2 时同步替换已通过旧哈希校验的 Skill/参考文件：新内部 ID 不自增、公共时间列 create_time/update_time、字符列继承表级 utf8mb4_general_ci；这是规范更新，不执行原业务表改名、主键转换或 collation 迁移。

旧版用户可以直接要求智能体更新。包已取消 install.py，旧的脚本命令不再作为新版入口；不要继续运行旧脚本把入口降回 1.0.0。

## 4. 安装验收

全部四类工具共 14 个文件（3 个规则入口、6 个主 Skill/参考文件、4 个薄入口、1 个状态文件）；仅 Codex/Cursor 为 8 个，仅 Claude Code 或 WorkBuddy/CodeBuddy 为 11 个。逐个确认实际内容、受管区块唯一、所有主入口及相对引用可读、状态哈希准确，检查原有区块外内容未变。整个安装不修改 Java、POM、数据库或项目依赖，不提交/推送。

在当前会话实际读取 AGENTS.md、开发 Skill、审查 Skill 及规范目录，分别说明日常开发如何遵守 Query/VO、权限、事务、SQL 和 DDL-001 建表规则，审查如何基于证据报告问题。给出写入文件和检查结果；不虚构业务代码作为安装验收，也不为安装运行 Maven。

规则/技能的自动发现取决于客户端版本、项目信任和组织策略。提示使用者新建项目会话检查可见性；可显式要求智能体读取 AGENTS.md 和相应主 Skill。文件及引用检查通过，不等于每种客户端都已实际加载或所有代码都会自动合规。
