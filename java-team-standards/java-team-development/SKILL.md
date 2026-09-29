---
name: java-team-development
description: 按团队规范初始化 Java/Spring 工程、设计 MySQL 表与生成 DDL、实现接口、修复缺陷和开展限定重构。初始化形成工程决策，开发按规则编号和样例实施并验证；仅要求审查时使用 multi-center-code-review，不自动改代码。
---

# Java 团队开发

完成用户指定的实现及验证。目标项目路径用于找源码与项目约定；本文件中的参考路径相对 Skill 目录解析。

## 先确认任务模式

- **初始化**：读取 [初始化决策与验收](references/initialization.md)，区分已确认、建议和待定。用户只要方案时交付方案；明确要求建工程时实现已确认的最小范围，不预造多个中台。
- **已有项目开发**：读取覆盖目标路径的 AGENTS.md、实际构建配置及相关现有实现；沿入口与调用方定位修改点，不全库扫描。
- **MySQL 表设计/DDL**：先读共用 [MySQL 建表规范](../multi-center-code-review/references/mysql-schema.md)（DDL-001），输出表职责、字段和索引依据，再生成目标版本 SQL、只读预检及后检；执行遵循已有授权范围。新内部 ID 用应用雪花 ID、不自增，公共时间列用 create_time/update_time，字符列默认继承表级 utf8mb4_general_ci；已有主键、金额单位及项目比较契约优先，不凭字段名批量加 ASCII/bin。不能从技术方案直接机械生成整套物理表。
- **纯审查**：使用审查 Skill；不要借审查要求自动整改。

## 实施

1. 按任务读取 [可执行规则](../multi-center-code-review/references/practical-rules.md) 对应编号；需要业务依据时再查 [完整规范](../multi-center-code-review/references/standards.md)。若依赖的参考文件缺失，报告缺失项，不声称已读取。
2. 说明改哪些文件、为何修改和风险；沿已有实现选择最小修改，不增加一次性接口、抽象基类或空业务模块。
3. Web 实现先确认方法、路径、请求体与错误契约：按完整规范 6.2 统计业务请求参数，超过 3 个使用 POST + @Valid @RequestBody，3 个及以内的简单只读查询可用 GET，不能仅因分页就强制 POST；已有接口按兼容要求调整调用方与安全配置。Query/DTO/VO 使用普通 class + Lombok，按完整规范 4.2 选择可变性和注解；同步标准 getter/setter 调用，并按 SERIAL-001 核验对象图及实际序列化协议，不自动改成 record。实现正常和必要的异常路径。业务政策未知不靠示例补齐，需确认的部分与可独立完成的工作分开。
4. 逐项核对本次修改的类、字段和手写方法注释，不能只补 Query/DTO/VO 字段而遗漏 Service 等业务方法；再按规则的验收场景运行最小有效验证。涉及 POST 查询时覆盖 JSON 绑定与错误、分页范围、动作/资源权限及适用的 CSRF；场景见 WEB-002、ERR-001、AUTH-001，不只验证正常返回。记录命令、断言、数量、结果与边界，不把编译或 mock 当成真实集成。
5. 交付实际修改、影响、验证及剩余项；不能用一份审查意见代替已经授权的实现。

| 任务 | 先读取的规则 | 完整规范补充 |
| --- | --- | --- |
| 初始化、构建 | INIT-001、CHECK-001；初始化指南 | 3、15～16 |
| Web 接口 | WEB-001、WEB-002、SERIAL-001、ERR-001、AUTH-001 | 4～6、13 |
| MySQL 建表、初始化 SQL、结构变更 | DDL-001；[建表规范](../multi-center-code-review/references/mysql-schema.md) | 10.3、对应业务专项 |
| SQL、状态与并发 | SQL-001、TX-001、CON-001 | 7～10 |
| 逻辑删除、回收站、恢复 | DDL-001、SQL-001、AUTH-001、TX-001；[逻辑删除规范](../multi-center-code-review/references/mysql-schema.md#41-逻辑删除字段读写与恢复) | 10.3；按表职责决定是否采用 deleted |
| 重放、消息、远程副作用 | IDEM-001、REMOTE-001、TX-001 | 12、对应业务专项 |
| 日志和异常 | OBS-001、ERR-001 | 14 |

规则适用性由实际行为决定，不仅看文件目录；分页、授权和错误契约以目标项目确认版本为准。不要混用不同 Spring Boot、校验包、ORM 或数据库方言。
