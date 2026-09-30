# 固定任务与评测证据

版本：2.4.0。本文供规范维护者使用，不随规则安装到业务工程。以下任务目前均为**未执行**；已有参考工程 HTTP 验证不代表模型对照评测完成。

## 1. 固定条件与材料分离

- 分开记录客户端自动发现、显式加载后模型遵循、生成代码实际行为。主动提供 Skill 只能证明后两者，文件存在不能证明客户端已发现。
- 规范固定到一个来源提交或离线 ZIP 的 SHA-256；参考工程固定到 [f1920457c84e41e92086eb6911f0acf28420806a](https://github.com/tyronczt/AI-Exploration/tree/f1920457c84e41e92086eb6911f0acf28420806a/java-team-standards/examples/reference-service)，另记录输入文件哈希。有/无规范组使用同一工程、模型、工具与提示，独立干净副本；建议每例重复 3 次，保留全部结果。
- 副本必须在独立临时目录，不重置、清理或注入当前工作区。记录实际 JDK、Boot、Maven、客户端、模型标识及工具权限；下载不到固定源码或环境不兼容时标为待核实，不偷偷换基线。
- 给受测智能体的材料只有本节约定的工程、固定用户提示和必要原始输入；有规范组另安装同一固定包。**不提供本文、注入方法或评审判定表**。评审者准备差异后只给实际 diff；标准答案不能进入受测提示。
- 编译、收集响应和 CLI 正常退出分别记录，不能代替验收判分。无权执行命令、没有实际日志或未运行行为断言时保留未验证项，不由评审者猜成通过。

## 2. 固定工程事实

基线是只读内存组织示例，无数据库、写入或消息链路。三条数据：

| id | displayName | enterpriseId | createdAt |
| --- | --- | --- | --- |
| org-a1 | Alpha | enterprise-a | 2026-01-01T00:00:00Z |
| org-a2 | Beta | enterprise-a | 2026-01-01T00:00:00Z |
| org-b1 | Gamma | enterprise-b | 2026-01-02T00:00:00Z |

alice 属 enterprise-a、bob 属 enterprise-b，均有 organization:read；blocked 属 enterprise-a，无读取权限。密码使用本次会话的临时值，不记录真实凭据。HTTP Basic、Cookie 和 CSRF 请求方法见 [工程 README](../examples/reference-service/README.md)，错误 CSRF 会在业务处理前返回 403。

已确认分页契约是 POST /api/reference/organizations/page，pageNo 从 1 开始、默认 1/20、pageSize 上限 100；稳定排序 createdAt DESC、id DESC。详情 GET /api/reference/organizations/detail?organizationId=org-a1。VO 仅含 id/displayName/createdAt。主体来自服务端认证，不能由 Query 的企业字段扩权。不得把本例已有 POST 改为 GET，或用本例宣称所有分页必须 POST。

## 3. 开发与需求任务 E1、E11

E1 固定用户提示：

```text
给现有组织分页接口增加可选字符串 name 筛选。缺失、null、空白表示不筛选；
非空白值先 trim，trim 后长度 1～100，按 displayName 区分大小写的 contains 匹配。
保留已有接口、认证、分页和错误契约，不新增依赖。完成实际验证并说明边界，
临时测试仅本地保留，不提交或推送。
```

E11 使用同一个提示，再追加以下一句，其他输入不变：

```text
还希望以后支持恢复删除的组织，但恢复权限、关联数据及占号政策尚未确认；
请单列需要确认的政策，先完成独立的名称筛选，不实现恢复功能。
```

评审者判定（不提供给受测智能体）：

| 场景 | 必须取得的证据 |
| --- | --- |
| alice，name=Alpha / 空格包围的 Alpha | total=1，仅 org-a1；代码按确认的 trim 语义实现 |
| bob，name=Alpha；alice，name=alpha | total=0，items 为空；分别证明资源范围和大小写语义 |
| alice，name 缺失/null/空白 | total=2，顺序 org-a2、org-a1，分页默认值保持 |
| alice，name=Alpha，pageNo=2、pageSize=1 | total=1、items 为空；total 在同范围筛选后、分页前计算 |
| trim 后 101 字符、非法分页 | 合法认证/CSRF 下 400；超长输入不能静默截断 |
| 附加 enterpriseId=enterprise-b | 客户端不能扩权；blocked 仍为 403，匿名详情仍为 401 |
| 分层与交付 | Query→内部 DTO→Service→VO 链路、注释和实际 JSON；没有直接暴露 Entity/DTO；每项已确认行为对应实现和断言 |
| E11 未定政策 | 单列待确认项，不新增删除字段/恢复接口或替业务批准恢复；筛选独立完成 |

依赖解析或启动失败会限制行为证据，不能因此凭生成代码判全部通过。可以用既有 Maven、HTTP 工具和本地断言，不为评测新增测试框架。

## 4. 审查任务 E3、E4

固定用户提示：

```text
审查指定范围，按本项目已采纳规则给出有证据的问题、真实路径和行号、
触发输入、影响及最小修正方向；记录逐文件覆盖及未验证项。只审查，不改代码。
```

E3 由评审者在基线副本的 src/main/java/com/example/reference/infrastructure/OrganizationRepository.java 中，将唯一的企业过滤返回语句替换为 `return ROWS;`，生成实际 diff。只给受测智能体 diff 和允许读取的工程，不告诉它删掉的是权限过滤。

判定：找到 Repository 中的资源隔离缺失，按 AUTH-001 追踪共享调用方 page/detail；alice 列表会包含 org-b1、total=3，详情 org-b1 也变为可见。动作权限仍存在，不能只要求 Controller 增加注解而忽略根因。允许用源码证明风险；未实际发送 HTTP 时不得宣称已运行越权复现。相关发现合并报告，不能重复凑条数。

E4 不注入差异，明确指定审查 OrganizationPageQuery、OrganizationController、OrganizationService、OrganizationRepository 四个文件；允许按调用链读必要上下文，但上下文不计作已完整审查。判定：不能为无写入的例子要求 Outbox、幂等表、分布式事务或 DDD 空层；有证据的真实问题正常记分，不能为“正常样本”强行忽略。文件覆盖和调用链检查必须有真实依据。

## 5. 安装任务 E5

用另一个独立临时项目，根 AGENTS.md 放以下原始内容，记录原始字节/换行；不需要 Java 工程或数据库：

```markdown
# 项目已有规则
仅处理当前用户任务；保留团队注释。
```

固定提示，提供同一个已记录哈希的离线完整包，并明确本次工具，例如 Codex：

```text
按这个包中的 INSTALL.md 将规范和两个 Skill 安装到指定临时项目，
仅接入 Codex，保留现有规则和修改；冲突不覆盖，不提交或推送。
```

依次独立验证：首装；原提示重装；评审者手工修改一个受管 Skill 后，将提示里的“安装”改为“更新”。判定：首次 9 个文件（Claude 或 WorkBuddy 为 12，四类兼容为 15）；区块外字节保持，受管区块唯一，7 个主 Skill/参考文件及来源/哈希记录准确；同内容重装不改文件或状态。第三步在落盘前报告冲突，所有目标内容和状态均保持更新前字节，不能先更新其他文件或伪造新哈希。目录及引用验证不等于客户端发现通过。整个任务不执行维护脚本、模型评测或 Maven。

## 6. 根因修复任务 E12

评审者在独立基线副本的 OrganizationService.java 中，将
`long offset = ((long) query.getPageNo() - 1) * query.getPageSize();`
替换为 `long offset = (query.getPageNo() - 1) * query.getPageSize();`，仅此一处。

固定用户提示：

```text
组织分页在 pageNo=2147483647、pageSize=100 时出现服务错误。
请定位根因并最小修复，保留既有接口契约，给修复前后验证证据与影响范围；
不要提交或推送，临时测试仅本地保留。
```

评审判定：合法认证/CSRF 后原偏移溢出为 -200，Stream.skip 拒绝负值并触发 500；原应为 200、items 空、total=2。检查相关 Web/内部 DTO 校验及 page 调用方，修复在共享偏移计算点而非拒绝合法大页码/改默认页。用同一输入复验，并核验正常分页和非法值；只有编译或新断言成功不等于原失败已修复。性能优化、SQL 下推和架构重构不在本例范围。

## 7. 配置评审任务 E13

本例为只读材料评审，冻结以下 Boot 3.5 输入；没有运行部署或真实凭据。应用仅有位于 com.example.reference 的 @SpringBootApplication，**无** @ConfigurationPropertiesScan/@EnableConfigurationProperties 或其他配置注册。已有 Lombok 与 spring-boot-starter-validation，配置类位于同根包 config 下：

```java
@Getter
@Setter
@Validated
@ConfigurationProperties("demo.partner")
public class PartnerProperties {
    @NotNull
    private Duration timeout;
    @NotNull
    private Endpoint endpoint = new Endpoint();

    @Getter
    @Setter
    public static class Endpoint {
        @NotBlank
        private String baseUrl;
    }
}
```

应用配置：application.properties 中 demo.partner.timeout=1s、demo.partner.endpoint.base-url=https://example.invalid；application-prod.properties 中 timeout=2s（完整键 demo.partner.timeout）。部署材料：SPRING_PROFILES_ACTIVE=prod、DEMO_PARTNER_TIMEOUT=0ms；未运行应用，尚无绑定值/启动日志。所有 URL 都为演示值，不应联网请求。

固定用户提示：

```text
根据提供的 Spring Boot 3.5 配置代码、配置文件与部署变量，评审实际绑定、
校验和生效风险，给最小修正建议与待验证项。只读分析，不修改或部署。
```

评审判定：区分未注册与已绑定；@NotNull 不拒绝零/负 Duration，嵌套约束缺少 @Valid；材料所示环境变量优先于 profile 值，但未注册/未启动时不能声称观察到实际值。给正值/缺失/嵌套非法值及 profile/env 覆盖的实际验证建议，说明现有 Bean 是否需重启；不混用 Boot 4、机械改成 record、新增依赖或输出配置密钥。判定表不要求受测智能体声称完成代码运行。

## 8. 结果记录

每次评测填写一份记录；通过必须链接实际产物或截断/脱敏证据。秘密、Cookie、令牌与个人数据不进入记录。

```text
任务/重复序号：
分组：无规范 / 固定规范；发现 / 显式加载 / 代码行为
规则版本、sourceCommit 或 sourceArchiveSha256：
工程基线、输入哈希、初始 Git 状态及副本路径：
模型、客户端/CLI、JDK/Boot/Maven 版本及工具权限：
固定用户提示、原始输入清单（不含判定表）：
产物路径、实际命令、退出码、行为断言与证据：
逐项结论：通过 / 失败 / 待核实 / 未执行
规则遗漏/误报、返工、用时、可取得的 token/费用：
未验证边界：
```

E2、E6～E10 仍是 [初始化指南](../java-team-development/references/initialization.md#4-验证规范是否真能帮助智能体)中的扩展任务清单，没有固定输入与行为证据前不能按此宣称已完成。修改规则后只复验受影响任务；普通安装和开发不自动启动评测。
