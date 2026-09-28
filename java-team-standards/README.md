# Java 团队开发规范与多中台代码审查

一套同时用于**写代码和审代码**的团队规范。覆盖 Java/Spring 分层、Query/DTO/VO、注释、接口、安全、SQL、事务、幂等、跨中台协作与异常恢复。支付只是其中一种场景，也适用于用户、组织、订单、库存、配置、任务和报表等能力。

## 直接交给智能体安装

在目标代码项目中打开 Codex、Claude Code、Cursor 或 WorkBuddy/CodeBuddy，把下面这段话发给智能体即可：

```text
请读取 https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/INSTALL.md，
按其中说明，将 Java 团队开发规范、java-team-development 开发 Skill 和
multi-center-code-review 审查 Skill 安装到当前项目，默认兼容四类工具。
请直接完成文件接入和验证，保留项目已有规则及未提交修改；有冲突时报告具体冲突，不覆盖。
不修改业务代码，不提交或推送。不要让我手动运行安装脚本。
```

同事无需安装 Python、Node.js 或 Git，也不用克隆仓库、复制多个配置文件。智能体需要能联网读取文件并修改当前项目；权限受限时仍需按客户端提示授权。

离线或无法读取 GitHub 时：[仅下载当前规范包 ZIP](https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/java-team-standards.zip)，解压后让智能体读取其中的 `INSTALL.md` 并安装。只使用部分工具时，在提示词后补充“仅接入 Claude Code”或其他目标工具。

## 写代码与审代码如何生效

| 入口 | 何时使用 | 内容 |
| --- | --- | --- |
| 项目 AGENTS.md | 日常开发与维护 | 持续生效的团队开发基线，引导智能体按任务读取完整规范 |
| java-team-development | 新增功能、修复缺陷、限定重构 | 编码前定位规则，编码中落实约束，交付前验证 |
| multi-center-code-review | 代码审查、PR/MR Review、合并前检查 | 追踪相关调用链，输出有证据的问题及验证边界 |

正常开发直接描述需求即可，也可以明确指定：

```text
按项目 Java 团队规范开发，使用 java-team-development，为当前用户模块增加分页查询。
先参考现有实现，落实 Query/VO、字段注释、权限校验和稳定排序，再完成代码与验证。
```

```text
使用 multi-center-code-review 审查当前未提交的 Java 变更，只输出有证据的问题和验证边界，不修改代码。
```

开发规范在写代码时使用，不需要等到 Review。仅提出审查请求不会自动修改代码；指定模块之外的存量代码不会因安装规范而被重构。开发与审查共用一份 [完整 Java 开发规范](multi-center-code-review/references/standards.md)。

## 项目中会增加什么

- 根 AGENTS.md：合并 [开发基线](rules.md)，保留原有内容。
- `.agents/skills/`：开发和审查两个 Skill，共享完整规范。
- CLAUDE.md 与 `.claude/skills/`：Claude Code 的规则导入及技能入口。
- `.codebuddy/CODEBUDDY.md` 与 `.codebuddy/skills/`：WorkBuddy/CodeBuddy 的规则及技能入口。
- 一份安装状态：记录受管内容的哈希，保护后续更新。

Codex/Cursor 使用 AGENTS.md 和 `.agents/skills/`。兼容入口由智能体按 [安装说明](INSTALL.md) 生成，业务规范只维护一份；项目已有明确业务契约和规则优先。

安装完成后新建项目会话，让智能体说明实际读取的规范和技能。工具版本、信任设置及组织策略可能影响自动发现；必要时显式让它读取 AGENTS.md 与主 Skill。文件检查通过不等于所有客户端已实测加载，也不能替代编译、测试及人工评审。

## 更新与已有项目

把安装提示词中的“安装”改为“更新到最新版”即可。相同内容重复接入不重复追加；更新先核对受管内容，手工改过的部分保留并报告冲突。项目补充放在受管区块外，团队基线修改到本包。

1.0.0 用户也通过智能体更新，原安装状态与规则区块可识别。2.0.0 已移除 Python 安装器，不需要继续执行旧命令；更新会补齐日常开发 Skill。安装不会自动提交 Git，团队可按自身评审流程纳入版本管理。

## 维护内容

```text
java-team-standards/
├── README.md
├── INSTALL.md
├── rules.md
├── java-team-development/SKILL.md
└── multi-center-code-review/
    ├── SKILL.md
    └── references/standards.md
```

只维护上述六个文件。独立 ZIP 是它们的分发副本，内部保留 `java-team-standards/` 顶层目录。更新源码时让智能体同步打包并核对内容；不包含测试、缓存、旧安装脚本或 ZIP 自身。

规范参考阿里、Google、AWS、Microsoft 的官方资料，采用范围和链接见完整规范第 20 节；没有捆绑第三方项目源码或整本开发手册。

入口参考：[Codex Skills](https://developers.openai.com/codex/skills)、[Claude Code 记忆与导入](https://code.claude.com/docs/en/memory)、[Cursor Skills](https://cursor.com/docs/skills)、[WorkBuddy 项目配置](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Project)。客户端加载仍需在使用环境核验。
