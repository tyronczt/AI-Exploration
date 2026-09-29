# Java 团队开发规范与多中台代码审查

用于 Java/Spring 项目初始化、日常开发和代码审查。支付只是业务场景之一；规范同样覆盖用户、组织、订单、库存、配置和任务。版本 **2.2.2**。MySQL 建表规范已补充外部资料核验，开发、审查和安装共用一份来源。业务请求参数超过 3 个使用 POST JSON，3 个及以内的简单只读查询可用 GET；分页按参数数量判断，不一律要求 POST。Query、DTO、VO 统一使用普通 class + Lombok，采用标准访问器（只读对象不强加 setter），并显式声明 Serializable 与各自的序列化版本号；JSON 和实际 RPC 协议分别验证。类、字段、手写方法及构造方法补充业务注释，覆盖 Controller、Service、Repository。开发与审查共用规则及验收条件，详见下方入口。

## 同事只需发一段话

在目标项目中打开 Codex、Claude Code、Cursor 或 WorkBuddy/CodeBuddy，把以下内容交给智能体：

```text
请读取 https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/INSTALL.md，
按说明将 Java 团队规范、开发 Skill 和审查 Skill 安装到当前项目，仅接入我当前使用的工具。
直接完成文件接入与验证，保留已有规则和未提交修改；冲突时报告，不覆盖。
不修改业务代码，不提交或推送，不要让我手动运行安装脚本。
```

需要团队同时使用四类工具时，把“仅接入我当前使用的工具”改为“兼容 Codex、Claude Code、Cursor、WorkBuddy/CodeBuddy”。更新时把“安装”改为“更新到最新版”。

不需要安装 Python、Node.js 或 Git，不需要克隆仓库。智能体须有联网和项目文件读写能力；受限环境按客户端授权。也可 [只下载当前包 ZIP](https://raw.githubusercontent.com/tyronczt/AI-Exploration/main/java-team-standards/java-team-standards.zip)，让智能体读取其中的 INSTALL.md。ZIP 包含规范及可选参考工程，不含构建产物或测试文件。

## 从哪里开始

| 你的任务 | 使用内容 | 得到什么 |
| --- | --- | --- |
| 接入规范 | [安装说明](INSTALL.md) | 项目入口、两个 Skill 和共用规则；安装不生成业务代码 |
| 还没有真实模块 | [初始化决策与验收](java-team-development/references/initialization.md) | 技术栈、契约、权限和检查命令的决策模板；未决项明确保留 |
| 想看能运行的代码 | [最小参考工程](examples/reference-service/README.md) | Java 21 / Spring Boot 3，Query/DTO/VO、分页、校验、错误、资源权限 |
| 日常编码 | [开发 Skill](java-team-development/SKILL.md) | 按任务选择规则、落实实现并验证 |
| 查具体标准 | [14 条可执行规则](multi-center-code-review/references/practical-rules.md) | 规则编号、适用条件、正反例、验收与例外 |
| MySQL 建表、生成 DDL 或改表 | [MySQL 建表规范](multi-center-code-review/references/mysql-schema.md) | 表字段、注释、类型、索引、约束、5.7/8 差异、模板与变更验收 |
| 代码审查 | [审查 Skill](multi-center-code-review/SKILL.md) | 真实行号、触发条件、证据、影响与最小修正方向 |
| 设计或高风险业务 | [完整规范](multi-center-code-review/references/standards.md) | 分层、事实归属、事务、幂等、SQL、安全和业务专项 |

初始化示例提示：

```text
使用 java-team-development，先根据本包初始化指南记录技术基线。
参考包内 reference-service 建立最小单模块工程；采用 Java 21 + Spring Boot 3。
先完成只读接口、分页、校验、错误和权限验证。数据库、认证平台与真实中台职责列为待定。
不要为未来需求创建空模块或引入中间件。
```

日常开发可以直接描述业务需求；明确指定时：

```text
按项目规范使用 java-team-development，为组织列表增加名称筛选。
复用现有结构，按接口定义的业务参数数量选择 HTTP 方法并评估既有契约兼容性；
保留 Query/DTO/VO 边界，补齐字段及方法注释。
核验绑定校验、资源范围、total 口径和适用的 CSRF，完成实际验证。
```

```text
使用 multi-center-code-review 审查当前未提交变更，按适用规则编号给出有证据的问题及验证边界，不改代码。
```

## 文件如何保持简单

AGENTS.md 只保留工作约束和导航。开发与审查共用参考文件；Claude/WorkBuddy 入口只转到主 Skill，不复制整套规则。默认仅当前工具，Codex/Cursor 共 8 个安装文件；全部兼容为 14 个，详情见安装说明。参考工程仅按需取用，不随规则安装复制到业务项目。

项目补充放 AGENTS.md 的受管区块外。受管内容以哈希记录；重复安装不重复追加，更新遇手工修改会保留并报告冲突。1.0.0/2.0.0 用户均可要求智能体更新，不再运行旧 Python 安装器。

建表前先按 DDL-001 确认表职责、字段语义和访问路径，再生成 SQL；默认不建物理外键、不用级联删除或触发器承载业务，例外按专项规范记录。新规则不自动修改存量表。2.2.1 补充关系/冗余设计、IPv6 与 ORM 映射、行宽/索引字节预算、隐含主键索引、严格模式及升级发布要求；[资料与采纳边界](multi-center-code-review/references/mysql-schema.md#12-外部资料核验与采纳边界)列出 GitHub、Linux.do、X 和指定博客的取舍。

主规范只有一个来源，分发 ZIP 与源码同步。维护范围是入口、安装说明、两个 Skill 的参考文档及 examples/reference-service；打包排除 target、缓存、临时验证文件和 ZIP 自身。

2.2.2 按支付表设计反馈修正规范与模板：新内部 ID 使用应用雪花 ID、不自增；公共时间列统一 create_time/update_time；字符列默认继承表级 utf8mb4_general_ci，取消无协议依据的 ASCII/bin 批量设置。现金支付示例沿用 BIGINT 整数分，保留存量主键与金额契约；增加数据库比较与应用幂等判断一致性的验收。更新规范不自动迁移任何业务表。

## 已验证到哪一步

- 参考工程完成 Maven 编译/打包、Checkstyle 和实际 HTTP 场景验证，明细见工程 README。
- 静态检查只覆盖少量可机械判断的格式规则；权限、幂等、事务等仍需行为验证和审查。
- 没有数据库、写入、MQ、真实认证或跨中台链路；不能据此宣称中台框架已具备生产能力。
- 多工具入口与引用可检查，但客户端自动发现受版本、项目信任和组织策略影响。安装后在当前工具新建会话核验；未完成四种客户端逐一实测或模型对照评测，评测方案见初始化指南。

规范参考阿里、Google、AWS、Microsoft 官方资料，采用边界见完整规范第 20 节；工程化实践参考 HumanLayer、Spec Kit 等，保留本团队 Query/VO 和权限约定，不整套照搬第三方框架。

入口依据：[Codex Skills](https://developers.openai.com/codex/skills)、[Claude Code 记忆](https://code.claude.com/docs/en/memory)、[Cursor Skills](https://cursor.com/docs/skills)、[WorkBuddy 项目配置](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Project)。
