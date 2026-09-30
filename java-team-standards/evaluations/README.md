# 固定任务与评测证据

版本：2.6.0。本文供规范维护者使用，不随规则安装到业务工程。以下任务目前均为**未执行模型评测**；已有参考工程 HTTP 验证或局部固定材料复验不代表模型对照评测完成。

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
| E11 未定政策 | 权限、关联恢复、占号分别列单点，说明依据/缺口、所需答案及阻断能力；不新增删除字段/恢复接口或替业务批准恢复；筛选独立完成，不重复询问已确认筛选条件 |

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

## 8. 代理与集合评审任务 E14、E15

两例为固定只读材料评审，不运行数据库、缓存或模型。受测智能体只取得本节的原始材料与用户提示；下方判定仅给评审者。

E14 原始材料：Spring Framework 6.2，事务为 proxy 模式；已启用 @EnableTransactionManagement(proxyTargetClass = true)，事务管理器正常，以下两个服务 Bean 均已注册，类与方法均非 final。两类位于同一包；没有 AspectJ、publicMethodsOnly 定制、类级事务注解或其他事务调用方。repository.write() 为本地数据写入，未提供或执行真实数据库。

```java
// TxReviewService.java
public class TxReviewService {
    @Transactional
    public void outer() {
        inner();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void inner() {
        repository.write();
    }

    @Transactional
    protected void protectedWrite() {
        repository.write();
    }
}

// TxReviewCaller.java；service 是注入的受管 Bean。
public class TxReviewCaller {
    public void invokeOuter() {
        service.outer();
    }

    public void invokeProtected() {
        service.protectedWrite();
    }
}
```

E14 固定用户提示：

```text
按给定 Spring 版本、配置及两个文件的实际调用链，审查事务传播与方法可见性。
只读分析，指出可证明的问题、路径/行号、影响与最小修正；没有执行数据库，
请保留验证边界，不修改代码或切换框架。
```

E14 评审判定：service.outer() 经类代理建立外层事务；其内部 inner() 的自调用不启动 REQUIRES_NEW，不能误报整个用例没有事务。给定配置下外部经类代理调用 protectedWrite() 可被拦截，不能仅凭 protected 报错。不把这一事务可见性规则套给缓存/异步注解；不自动安装 AspectJ、自注入或新增框架。未运行数据库时只报告配置/源码推导，实际传播、回滚及数据结果列待验证。

E15 原始材料：JDK 21，input 非 null，元素均为非 null 字符串；目标只有以下片段，未配置静态规则强制使用 Stream、Optional 或特定列表实现。

```java
// TagService.java
List<String> tags(List<String> input) {
    return input.stream().map(String::trim).toList();
}

// TagCaller.java；两个方法相互独立。
List<String> appendSummary(List<String> input) {
    List<String> tags = service.tags(input);
    tags.add("summary");
    return tags;
}

int readCount(List<String> input) {
    return service.tags(input).size();
}
```

E15 固定用户提示：

```text
审查这两个文件的集合返回契约，给出真实触发路径、影响和最小修正，
同时说明只读调用是否有问题，以及换成 Collectors.toList() 能保证什么。
只读分析；没有运行代码时不要声称已复现，不新增依赖或改无关接口。
```

E15 评审判定：appendSummary 即使输入为空，也会因返回列表不可修改在 add 处抛 UnsupportedOperationException；readCount 无该问题。需可变结果时明确采用 ArrayList 副本或 toCollection(ArrayList::new)，由实际契约选择位置；不能为只读调用统一加副本。Collectors.toList() 不保证可变性，不应断言一定为 ArrayList 或一定会抛同一异常。指出真实位置和源码/JDK 依据，区分推导与实际复现；不要求全量替换循环、加 Optional/Builder 或修改 Web 契约。

## 9. Redis 评审任务 E16、E17

两例为固定只读材料评审，不连接 Redis/数据库，也不运行消息或锁命令。给受测智能体仅本节各例的原始材料及固定提示，有规范组另提供同一固定包；下方评审判定留给评审者。反例/对照彼此独立，不向参考工程添加 Redis 依赖。

E16 原始材料：服务端 Redis 6.2 Standalone。Key 仅为虚构组织缓存；任务统计扫描范围内唯一 Key 的数量。为判断游标处理，提供固定三次返回，数量不是实时数据库证据：

```text
ScanPages.txt
输入 cursor=0  -> cursor=9,  keys=[org:profile:a1]
输入 cursor=9  -> cursor=12, keys=[]
输入 cursor=12 -> cursor=0,  keys=[org:profile:a1, org:profile:a2]

ScanJob.pseudo
cursor = "0"; total = 0;
do {
    page = scan(cursor, "org:profile:*", COUNT=1);
    cursor = page.cursor;
    if (page.keys.isEmpty()) break;
    total += page.keys.size();
} while (cursor != "0");

UnlockA.pseudo
if (ownerToken == GET(lockKey)) {
    DEL(lockKey);
}

UnlockB.lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0
```

释放的固定交错：A 已用 SET NX PX 取得 ownerToken=a；UnlockA 的 GET 返回 a 后暂停，租约到期，B 以 ownerToken=b 成功取得同 Key，A 随后继续。UnlockB 另作独立对照：A 在 B 已取得锁时以参数 a 执行。两例没有提供其他业务写入代码，不能推定整个业务层没有持久化保护。

E16 固定用户提示：

```text
按 Redis 版本、固定扫描返回和锁的交错材料，审查统计、终止及释放是否正确。
指出真实文件/位置、最短触发、影响和最小修正，并说明对照及未提供的业务保护。
仅分析，不连接实例、不执行命令、不改代码；不要把推导写成实际 Redis 复现。
```

E16 评审判定：ScanJob 在中间空批提前结束，漏 a2；继续到游标 0 后仍需按唯一统计处理重复 a1，样本唯一数量为 2。COUNT=1 不保证最多一个元素，不能据最后批两条判材料非法；不能假设 SCAN 是快照或按业务页码使用。UnlockA 能误删 B 的锁，修正须原子 owner 比较释放；不能只把 GET 换成 EXISTS。UnlockB 此交错返回 0 并保留 B 锁，不报告同样误删缺陷；但安全释放不证明迟到业务写入安全。给出数据库条件/幂等或实际 fencing 的核验方向，未提供实现列边界，不断言已重复执行。不引入新锁框架、全库扫描或猜测线上结果。

E17 原始材料：Redis 6.2，Stream `org:events` 和消费组 `projection` 已按已确认历史起点创建；BLOCK、连接超时及实例 consumer 身份已另行配置。业务要求每个 eventId 只累计一次组织统计，写入和防重都在同一选定数据库；项目已有原子登记方法及真实提交入口。伪代码中的 db.transaction 只有实际提交成功才返回，失败会回滚本地登记和统计。原子登记区分新事件与已完成事件，并核验参数指纹；这里不提供其实现或生产端，不评价未给出的代码。

```text
Messages.txt
Stream ID=1000-0, eventId=e1, fingerprint=p1
Stream ID=1001-0, eventId=e1, fingerprint=p1
两条表示同一业务事件的重发；故障场景与重复场景分别评审。

ConsumerA.pseudo
message = XREADGROUP(GROUP projection worker-a, STREAMS org:events >);
XACK(org:events, projection, message.streamId);
db.transaction(() -> registerAndApplyOnce(message.eventId, message.fingerprint));

ConsumerB.pseudo
message = XREADGROUP(GROUP projection worker-b, STREAMS org:events >);
db.transaction(() -> registerAndApplyOnce(message.eventId, message.fingerprint));
XACK(org:events, projection, message.streamId);

Retention.txt
维护计划：按固定 MAXLEN 裁剪，不读取最慢消费组进度。
现有材料明确：一个未确认事件仍在 PEL，但正文位于本次拟裁剪范围。
```

E17 固定用户提示：

```text
审查给定可靠消费与裁剪材料，覆盖提交前失败、提交后 ACK 失败及重复业务事件。
分别说明两个消费路径的缺陷/对照、旧 PEL 的恢复方式和裁剪影响。
按现有约束给最小修正与验证边界，不推定未提供的生产端有缺陷，不改 MQ 或新增依赖。
只读分析，不执行 Redis/数据库命令，不声称已完成故障演练。
```

E17 评审判定：ConsumerA 已移除 PEL 后本地失败，可使该次事件不再由 pending 恢复；不能用“DB 会回滚”当跨资源保护。ConsumerB 的给定提交顺序合理，ACK 失败可能重投，但同一事务的稳定 eventId 防重避免再次累计，不能单凭缺少跨资源原子事务报重复执行。业务 eventId 与 Stream ID 不混用；XACK 不删除正文或代替其他消费组确认。Redis 6.2 的普通 `>` 读取不恢复旧 PEL，应核验 XPENDING/本消费者 pending 读取及 XCLAIM/XAUTOCLAIM 的有界接管和 idle 阈值，接管仍需业务保护。给定裁剪会失去未确认正文，PEL 引用不能证明可回放，需按相关组进度与恢复保留边界调整。状态重建、毒消息与永久错误政策未提供时列待核实，不声称全链路 exactly-once，不要求已提交正常路径改用其他 MQ。

## 10. Java 基础评审任务 E18

以下仅为固定材料，**模型评测未执行**。原始材料按文件保存到隔离副本 `src/JavaContractSamples.java` 后再交给受测智能体；判定段由评审方单独保留，不写入该源码。JDK 21；输入合法日期要求原样输出公历年，非法日期必须拒绝；比较器要求整数自然升序。目标仅这六个方法的日期/比较行为，没有其他日期框架或排序业务，不将示意材料的封装/注释作为评审范围。

```java
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Locale;

final class JavaContractSamples {
    static String formatA(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("YYYY-MM-dd", Locale.UK));
    }

    static LocalDate parseA(String input) {
        return LocalDate.parse(input, DateTimeFormatter.ofPattern("uuuu-MM-dd"));
    }

    static int orderA(int left, int right) {
        return left - right;
    }

    static LocalDate parseB(String input) {
        return LocalDate.parse(input, DateTimeFormatter.ofPattern("uuuu-MM-dd")
                .withResolverStyle(ResolverStyle.STRICT));
    }

    static String formatB(LocalDate date) {
        return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    static int orderB(int left, int right) {
        return Integer.compare(left, right);
    }
}
```

固定用户提示：

```text
按已采纳的 Java 基础规则审查 src/JavaContractSamples.java，给出真实行号、
触发输入和最小修正方向；有条件可在隔离副本复验，未运行项说明边界。
只审查这些方法，不改业务代码，不新增工具库。
```

评审判定：formatA 对 2019-12-30 输出 2020-12-30，周所属年不能作公历年；parseA 的 SMART 默认解析将 2023-02-29 调整为 2023-02-28，与拒绝政策冲突；orderA 比较 MIN_VALUE 与 MAX_VALUE 得正数，破坏自然排序/传递性。parseB 合法 2024-02-29 通过、非法 2023-02-29 拒绝，formatB/orderB 按契约正确，是正常对照；不能仅因抛解析异常就判错误。修正只需公历格式、STRICT 和 Integer.compare 等已有 API，不要求重写所有日期类/引入库。材料验证不等于模型会发现；规则为 JAVA-001。

## 11. 前后端协议评审任务 E19

原始材料：新增 `GET /api/sample/detail` 只有两个业务字段（id、view），JSON 接口；实体时间点是 `2026-09-30T02:00:00Z`，金额单位元/2 位小数，ID 必须精确保留。私有详情政策禁止缓存存储；204 代表无内容。跳转输入为字符串，允许 HTTPS 的 trusted.example 默认端口和本站相对路径，拒绝协议相对 URL、userinfo、其他域名、反斜线及未编码的 ASCII 空白/控制字符。A/B 是两组独立对照，未提供实际后端/网关/浏览器，不评价其未知实现。

`fixtures/http-a.txt`：

```text
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache

{"id":9007199254740993,"amount":"0.10","occurredAt":"2026-09-30T10:00:00"}
```

`fixtures/http-b.txt`：

```text
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"id":"9007199254740993","amount":"0.10","occurredAt":"2026-09-30T10:00:00+08:00"}
```

`src/client-contract.js`（同文件保存 A/B，URL 为项目 JS 运行时的标准 API）：

```javascript
function parseA(status, body) {
  return JSON.parse(body);
}
function redirectA(input) {
  return input.includes("trusted.example") ? input : "/";
}
function parseB(status, body) {
  return status === 204 ? null : JSON.parse(body);
}
function redirectB(input) {
  try {
    if (input.startsWith("//") || /[\\\u0000-\u0020\u007F]/.test(input)) return "/";
    const url = new URL(input, "https://trusted.example");
    if (url.protocol !== "https:" || url.hostname !== "trusted.example"
        || url.port !== "" || url.username || url.password) return "/";
    return url.href;
  } catch {
    return "/";
  }
}
```

固定用户提示：

```text
审查给定 HTTP 报文与 src/client-contract.js 的前后端契约，
核对 fixtures/http-a.txt、fixtures/http-b.txt 和解析/跳转函数；
给出触发条件与具体证据，不改代码、不推定未提供的后端有缺陷。
```

评审判定：A 的 ID 经常用 JS Number 解析不能保留目标整数；A 的时间无偏移与已确认唯一时刻不符，在 UTC/Asia/Shanghai 两种环境不能稳定表示同一时刻；no-cache 允许存储，与禁止存储政策冲突。parseA 对 204 + 空正文抛 JSON 解析错误；redirectA 会接受 `https://trusted.example.evil/`、`https://trusted.example@evil.example/`。B 的字符串 ID/偏移时间/no-store 与政策相符，parseB 与 redirectB 按给定条件是安全对照；未给网关和浏览器证据时只作材料/JS 层判断。不能把两个业务字段的 GET 判为违反分页 POST，也不强制加包装、转换金额为 Number、禁止所有重定向或缓存。规则为 WEB-003，按实际内容关联 SERIAL-001/ERR-001/AUTH-001。

## 12. SQL 与 Maven 评审任务 E20

原始材料：MySQL 8.0/MyBatis 3，`fixture_statistics` 有 id、enterprise_id、create_time 和可空 DECIMAL(18,2) 的 amount 列；合计约定“无行/全 null 为 0.00”，保留金额精度，记录数包含金额为 null 的行。查询只读并限定可信 enterpriseId。表仅为材料，无授权连接/建表；受测者不得推定实际数据量/索引。统计由 A/B 方法独立展示；B 的 COALESCE 有上述已定政策依据。

`mapper/StatisticsMapper.xml` 的局部材料：

```xml
<select id="countA" resultType="java.lang.Long">
  SELECT COUNT(amount) FROM fixture_statistics WHERE enterprise_id = #{enterpriseId}
</select>
<select id="countB" resultType="java.lang.Long">
  SELECT COUNT(*) FROM fixture_statistics WHERE enterprise_id = #{enterpriseId}
</select>
<select id="sumA" resultType="java.lang.Long">
  SELECT SUM(amount) FROM fixture_statistics WHERE enterprise_id = #{enterpriseId}
</select>
<select id="sumB" resultType="java.math.BigDecimal">
  SELECT COALESCE(SUM(amount), 0.00)
  FROM fixture_statistics WHERE enterprise_id = #{enterpriseId}
</select>
<select id="page" resultType="sample.StatisticsDO">
  SELECT id, amount FROM fixture_statistics
  WHERE enterprise_id = #{enterpriseId}
  ORDER BY ${orderColumn}, id DESC LIMIT #{limit}
</select>
```

`src/StatisticsCalls.java` 的局部材料：

```java
// sumA 声明返回 Long；缺失合计路径没有额外空值处理。
long amountA = mapper.sumA(trustedEnterpriseId).longValue();
// page 的 orderColumn 只能来自下列代码映射，limit 已校验 1..100。
String orderColumn = switch (validatedSort) {
    case "amount" -> "amount DESC";
    case "created" -> "create_time DESC";
    default -> throw new IllegalArgumentException("unsupported sort");
};
```

`pom.xml` 的局部材料：完整工程未引入 commons-text、未继承其他 parent、没有其他相关 dependency，代码却 import 并调用其 StringEscapeUtils；POM 有且仅有以下版本管理，不提供构建结果。

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.apache.commons</groupId>
      <artifactId>commons-text</artifactId>
      <version>1.12.0</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```

固定用户提示：

```text
审查 mapper/StatisticsMapper.xml、src/StatisticsCalls.java 和给定 POM 事实，
按 SQL 与工程规则说明有证据的问题、正常对照和未验证项；
不连接数据库、不执行 DDL，不新增依赖或自动整改。
```

评审判定：COUNT(amount) 排除 null，不满足记录总数口径；两行金额为 null/1.20 时 A=1、B=2，无行时均为 0。SUM 可为 null，A 的拆箱/longValue 存在 NPE，Long 也不能保留 2 位小数金额；B 的 BigDecimal/COALESCE 与已定政策吻合。`${orderColumn}` 来自明确代码白名单而非原始请求，不能仅凭 `${}` 报注入；值参数正确绑定，其他调用入口和索引未提供，不虚构“全表扫描”。dependencyManagement 不引入 commons-text，在给定事实下不可用；先复用实际 JDK/现有能力或根据需求处理，不把导入缺失当已经授权新增库。固定版本是评测样本，不是依赖推荐。材料静态判断不能称 MySQL/Mapper/实际 Maven 已通过；规则为 SQL-001、INIT-001、CHECK-001。

## 13. 结果记录

2026-09-30 的 2.6.0 维护校验：在本地临时目录提取 E18/E19 原始代码并运行，JDK 21.0.7 的 E18 与关联日期/集合/精度/资源边界共 30 条断言、Node 24.19.0 的 E19 共 26 条断言通过；JS 包含 UTC/Asia/Shanghai 两种解析环境。E20 XML 解析与材料一致性检查通过，未连接/运行 MySQL、MyBatis 或其 Maven 工程。上述不是受测模型的结果，也不证明真实网关/浏览器/Redis 行为；完整模型任务仍为未执行。验证脚本仅保留本地，不进入安装或分发文件。

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
