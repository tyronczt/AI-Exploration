# 可执行规则：编码与审查共用

版本 2.1.0。这里把已有规范转换为可检查的最小规则；完整依据见 [系统与多中台规范](standards.md)。示例类型/方法是局部示意，除参考工程外不代表能直接编译。规则由项目采纳后生效，已确认业务契约优先；无法从源码确认的政策列为待核实。

| 编号 | 适用场景 | 主要验收方式 |
| --- | --- | --- |
| INIT-001 | 初始化或调整工程形态 | 决策与实际构建比对 |
| WEB-001 | Web 出入参 | 签名、序列化和转换检查 |
| SERIAL-001 | 传输对象、缓存、事件及序列化配置 | JSON 契约、对象图与实际协议往返验证 |
| WEB-002 | 分页列表 | HTTP 边界、排序和资源范围验证 |
| ERR-001 | 接口异常 | HTTP 状态与脱敏验证 |
| AUTH-001 | 受保护资源 | 动作与资源交叉验证 |
| SQL-001 | 数据库查询 | 限定范围的 EXPLAIN 与 SQL 检查 |
| TX-001 | 本地写入和外部副作用 | 实际事务与失败注入 |
| CON-001 | 并发状态变化 | 并发和影响行数验证 |
| IDEM-001 | 可重复的有副作用操作 | 同参、异参和崩溃恢复验证 |
| REMOTE-001 | 外部调用 | 超时、预算与未知结果恢复 |
| OBS-001 | 日志与审计 | 输出内容及关联性检查 |
| CHECK-001 | 交付 | 命令及证据分层 |

## INIT-001：以已确认决策创建最小工程

**适用**：新建工程、增设服务或依赖。**要求**：先记录技术版本、部署形态和需求依据；未定数据库和领域不生成空模块。

- 反例：为了“多中台”先创建 payment、account、settlement 三套空服务，并强制引入 Redis/MQ。
- 正例：先建一个部署单元和一个业务切片；边界确有独立演进或容量需求时再拆。
- 验收：构建文件与决策一致，每个新增依赖都有实际调用；应用能启动。只交方案时不以缺少代码报错。
- 例外：已有组织技术基线直接继承并标来源，不重复选型。

## WEB-001：Web 只接 Query、返回 VO

**适用**：JSON/表单 Web 业务接口。**要求**：Controller 做输入校验、边界转换和入口编排；Service 执行业务。DTO 不直接成为 Web 契约。Query/DTO/VO 使用普通 class + Lombok，访问器用 getXxx/setXxx；注解选择及可变性见完整规范 4.2。Service/Controller/Repository 的手写方法及构造方法按完整规范 4.3 补充 Javadoc，说明参数、返回及实际权限/异常语义，不能用类注释代替。Query/DTO/VO 类与字段必须有准确业务注释；状态列取值、金额列单位、展示字段列来源。

```java
// 反例：直接暴露内部 DTO，后续内部字段变化会改变公共响应。
public OrganizationDTO detail(OrganizationDTO request) { ... }

/**
 * POST /api/reference/organizations/page：只读查询当前主体可见的组织。
 * JSON 空对象使用页码 1、每页 20 条，上限 100；缺失/非法请求体或校验失败返回 400，
 * 媒体类型不支持返回 415。认证和适用的 CSRF 由安全链处理，动作及资源权限由服务校验。
 *
 * @param query 经绑定和校验的分页 Query，不包含可由客户端修改的授权范围
 * @param authentication 框架提供的认证身份
 * @return 可见组织及同范围 total；越过末页返回空 items，保留 total
 */
@PostMapping("/page") // 所在 Controller 的类级路径为 /api/reference/organizations
public ApiResponseVO<OrganizationPageVO> page(
        @Valid @RequestBody OrganizationPageQuery query, Authentication authentication) {
    OrganizationPageDTO page = service.page(new OrganizationPageQueryDTO(query.getPageNo(), query.getPageSize()),
        identities.caller(authentication));
    return ApiResponseVO.ok(new OrganizationPageVO(page.getItems().stream().map(this::toVO).toList(),
        page.getTotal(), page.getPageNo(), page.getPageSize()));
}
```

HTTP 方法选择见完整规范 6.2：接口定义的业务请求参数超过 3 个使用 POST + @Valid @RequestBody，3 个及以内的简单只读查询可用 GET + @ModelAttribute。可选项、分页及继承字段计入，Query 包装不改变数量，认证/CSRF/追踪信息不计入；嵌套及集合按 6.2 处理。上例保留已确认的 POST 教学契约，不表示只有两个参数的分页必须 POST。注释说明完整路径、实际绑定方式、默认值及错误；POST 验证缺失/非法 JSON、415 和适用的 CSRF，GET 验证查询参数绑定。既有公开接口需评估兼容性，不擅自批量改造。

验收：检查 Controller 签名和实际 JSON，不含内部企业范围、ORM 字段或持久层分页对象；缺参走校验错误。转换可用已有工具，不能为几个字段强加转换框架。

例外：文件下载、流式输出、第三方既定回调按已确认协议，不强包 VO；记录原因与契约验证。

## SERIAL-001：序列化能力和线上的协议分别验证

**适用**：Query/DTO/VO、RPC 请求响应、消息和缓存值。**团队约定**：传输类统一实现 Serializable，并各自显式声明 `@Serial private static final long serialVersionUID = 1L;`；JDK 低于 14 时省略 @Serial。这是团队约定，不是 Jackson 输出 JSON 的前提。

```java
/** 按稳定组织标识查询当前主体有权访问的组织。 */
@Getter
@Setter
public class OrganizationDetailQuery implements Serializable {
    /** Java 对象流的类版本；兼容演进时保持稳定。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 稳定组织标识。 */
    @NotBlank
    private String organizationId;
}
```

上例省略 import。已有合适的 BaseQuery/BaseRequest 可以复用；每个可序列化子类仍声明自己的 UID，不把父类 UID 当成全继承树版本。没有公共字段或行为时可直接实现接口，不为消除标记重复建立空继承层。

- 反例：只在父类写 UID；给包装类加 Serializable 就假设任意泛型 payload 都可序列化；为了改 getter 或加可选字段机械递增 UID。
- 正例：类型及整个非 transient 对象图都满足所选序列化器要求，嵌套 DTO、集合元素和实际泛型类型一并验证。兼容改动维持 UID；破坏性变更先设计新旧读取、缓存失效或迁移策略，不能只改版本号。
- JSON 出参用 getter 暴露约定字段；入参需无参构造和 setter，或显式 Jackson creator/property 映射。不能用 `@NoArgsConstructor(force = true)` 绕过 final 字段和构造校验。仅作为输出的 VO 不必为了并不存在的反序列化需求增加 setter。
- 泛型 JSON 反序列化保留 `TypeReference`/`JavaType`，不能只传裸包装类。字段名称、时间/时区、枚举、BigDecimal、超出 JavaScript 安全整数范围的 ID，以及缺失/null/未知字段策略按实际契约固定。
- `serialVersionUID` 不控制 JSON/RPC schema，Serializable 不等于所有 RPC 序列化器兼容；依据实际 Dubbo/HTTP、消息、Redis 序列化配置验证，不能从文件名推断协议。
- `transient` 的 Java 语义不能代替 JSON 的字段隔离策略；敏感字段分别按序列化器显式排除并验证。服务端 CallerDTO 等身份上下文只能由可信认证关系建立，可序列化不代表可以信任客户端反序列化结果。
- 不对外部不可信字节启用 Java 原生反序列化。原生反序列化通常不调用 Serializable 类的普通构造方法；构造校验、默认值和防御性复制不能当成该入口的安全保障。确有业务需求时限定类/深度/大小并验证恢复后的不变量，或采用能验证输入的明确协议。

**验收**：使用实际 ObjectMapper 核验 Web 字段、Query 默认值和校验；原生序列化在隔离环境用本地产生的可信对象做往返，测试嵌套集合及非 Serializable payload 失败；实际用到 RPC、缓存或事件时，再测相应序列化器及新旧版本交叉读取。一次同版本往返不证明升级兼容。

**例外**：纯领域实体、基础设施对象不因“可能传输”自动加 Serializable；已有项目不采用本约定时按其真实契约评估，不强迫为 JSON 添加继承层。

## WEB-002：分页有边界、有稳定顺序

**适用**：列表和分页导出。**要求**：分页与其他查询按相同参数数量规则选择 HTTP 方法：业务请求参数超过 3 个用 POST + @Valid @RequestBody，3 个及以内的简单查询可用 GET + @Valid @ModelAttribute，查询本身只读；页码起点、默认值、最大值、超限行为先在契约确定。请求使用分页 Query，响应分页 VO；total 与 items 使用同一权限和筛选条件。复杂条件增加长度、集合大小、嵌套校验和排序字段白名单，不能因放进 JSON 就免于限制。

```java
// 反例：不校验大小；先全库计数，再只过滤本页，会泄漏总数并产生空页。
return new PageVO<>(filterForCaller(repository.findAll()), repository.countAll(), pageNo, pageSize);

// 正例：先按可信主体限制数据，再计数和分页；乘法先升为 long 防溢出。
long offset = ((long) query.getPageNo() - 1) * query.getPageSize();
// SQL 场景：items 和 count 共用企业及业务过滤条件，ORDER BY created_at DESC, id DESC。
```

**验收**：先满足认证及适用的 CSRF 前置条件，再检查绑定和业务行为；默认值以项目契约为准，不能直接把示例数值视为生产要求。

| 输入或场景 | 预期与检查点 |
| --- | --- |
| 参数数量和结构 | 统计接口定义而非本次填写数量；3 个简单参数可 GET，增加至 4 个用 POST；复杂结构按 6.2 判断 |
| GET 缺省/空查询参数；POST `{}`、字段缺失/null | 按实际绑定方式验证默认值或拒绝行为；GET 不依赖请求体，POST 缺失请求体不等于空对象 |
| 0/负数、超上限、不可绑定的非数字 | 返回约定的 400 错误体；POST 同时核验 ObjectMapper 的数字/字符串强制转换策略 |
| POST 缺失请求体、非法 JSON、不支持的 Content-Type | 分别验证 400、400、415；不机械套给 GET 接口 |
| 错误 HTTP 方法 | 返回 405；路径仅声明 POST 时核验 GET 不进入用例，反之亦然 |
| 极大页码、末页、同创建时间 | offset 不溢出；越界 items 为空但 total 正确；排序带唯一键 |
| 两个企业、组合筛选、不同动作权限 | items 与 total 范围一致；客户端参数不能扩大授权范围 |
| GET 改 POST 或调整请求结构 | 同步调用方、接口文档和安全验证，按已确认契约安排迁移 |

稳定排序不承诺并发写入下 offset 分页的快照一致性，强一致遍历另选游标/快照方案。数据库查询应下推筛选、排序、计数和分页；参考工程的少量固定数据内存分页不是生产大表方案。

例外：历史接口保持已公布契约，改变限制或排序先评估兼容性。

## ERR-001：错误有类型，不泄漏内部信息

**适用**：Web 和服务边界。**要求**：区分参数、未认证、无权、不存在和系统故障；不能用 HTTP 200 掩盖失败。明确安全消息、稳定错误码及关联方式。

```java
// 反例：return ApiResponseVO.ok(exception.getMessage());
// 正例：参数错误返回 400 + INVALID_ARGUMENT，系统异常返回 500 + INTERNAL_ERROR。
// 未预期异常在统一边界记录一次堆栈；对外只给固定安全提示。
```

验收：HTTP 状态与错误体一致，分别覆盖 JSON 解析/参数校验 400、未认证 401、权限拒绝 403、资源不存在 404、方法不支持 405、媒体类型不支持 415 及系统故障 500；响应不含 SQL、堆栈、密码、Token 或内部路径。安全过滤链的 401/403 也遵守错误契约。认证、CSRF、路由和绑定存在执行先后，多项同时失败时按实际链路判断，不能一律断言匿名 POST 必须返回 401。不得吞异常后继续提交不完整业务。

例外：外部协议指定响应格式时按协议适配，保留内部分类和观测。

## AUTH-001：登录不等于有权，角色不等于资源归属

**适用**：受保护的详情、列表、写入、导出和异步执行。**要求**：身份来自验证后的会话/凭证，企业范围来自可信授权关系；不能信任客户端传入的企业 ID 作为权限证明。动作权限和资源归属都检查。

```java
// 反例：repository.findById(query.getId()); // 只判断已登录
// 正例：先检查 organization:read，再按 id + caller.getEnterpriseId() 查询。
// 列表、总数、缓存键、任务执行上下文同样包含有效资源范围。
```

验收：匿名、无动作权限、同企业、跨企业、不存在资源；示例将跨企业和不存在统一为 404，实际项目采用已确认的防枚举政策。后台任务不能因为没有 HTTP Controller 就跳过授权依据。

使用 Cookie、HTTP Basic 等浏览器自动附带凭证时，核验适用的 CSRF 保护：缺失/错误令牌应拒绝，有效凭证与令牌可连续完成请求；令牌轮换或会话变化按真实策略验证。CSRF 令牌不是身份凭证，不能单凭令牌取得身份；Cookie 是否承载登录身份由项目认证方案决定。不得为了切换 POST 全局关闭 CSRF。参考工程的 Basic、令牌获取路径和安全上下文存储配置仅为教学实现，不要求生产项目照搬。

例外：明确公开数据列入公开清单；不能用管理员名称或前端隐藏按钮替代服务端判断。

## SQL-001：条件有界，索引有证据

**适用**：查询、导出与排查。**要求**：参数绑定、显式字段、数据范围、稳定排序；大表先对限定查询做 EXPLAIN，索引依实际过滤/排序和基数评估。

```sql
-- 反例：SELECT * FROM organization ORDER BY created_at DESC;
-- 正例：仅作结构示意；执行前确认库、表、字段和绑定值。
SELECT id, display_name, created_at
FROM organization
WHERE enterprise_id = :trusted_enterprise_id
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

验收：没有字符串拼接注入；items/count 口径一致；说明扫描量和排序行为。数据库连接仅只读；写入/迁移脚本先按完整规范 10.2 提供影响数、LIMIT 20 样例和冲突预检。不能把内存查询演示当成 SQL 已验证。

例外：小表合理全扫不自动判为缺陷；以数据量、计划和成本判断。规范不自动授权建索引。

## TX-001：本地事务不能回滚外部副作用

**适用**：多个本地写入或跨系统副作用。**要求**：明确事务入口、传播、回滚异常与代理是否生效；本地事实一致提交。远程操作先明确稳定请求号与恢复协议，不用长事务包住网络调用冒充原子性。

```java
// 反例：同类 this.saveInTransaction()，误以为 @Transactional 一定生效；
// 或事务内先调用银行，再认为本地 rollback 可以撤销已付款。
// 正例：经有效事务入口原子保存本地意图；外部执行沿稳定操作号查证/恢复。
```

验收：在真实选定数据库上注入第二次写失败，确认第一次回滚；覆盖“远程成功、本地失败”恢复。仅检查注解、编译或 mock 不足以证明事务。

例外：纯只读查询无须硬加事务；跨资源需要可靠事件时再评估 Outbox，不强制引入。

## CON-001：状态修改必须校验旧状态与实际影响

**适用**：状态流转、预算、库存及并发资源修改。**要求**：数据库条件更新/版本条件保护不变量，并检查影响行数；先查再改不具备并发保护。

```java
// 反例：if (load(id).isPending()) { saveSuccess(id); }
// 正例：底层更新同时限定 id、归属及期望状态，变更计数必须恰为 1。
int affected = repository.transition(id, owner, PENDING, SUCCESS);
if (affected != 1) {
    throw new StateConflictException();
}
```

验收：并发执行两次、成功后迟到失败、同版本竞争；只能一次改变事实。扣减还需原子预算条件，0 行须按实际事实区分重复、冲突或无权，不直接当成功。

例外：无状态变化的只读能力不适用；分布式锁不能替代持久化不变量。

## IDEM-001：同号同意图，异参必须拒绝

**适用**：客户端可重试写请求、回调、任务和消费。**要求**：定义幂等作用域（主体/操作类型/操作号）、有效期、参数指纹、并发占位与结果；同键异参拒绝，同参重复返回原结果或明确处理中。

```java
// 反例：每次重试重新生成 requestId，或仅 Redis SETNX 后立刻执行不可恢复副作用。
// 正例：稳定 operationId + 持久化唯一约束；同事务登记本地事实；
// 已成功复用原结果，处理中/未知按原号恢复，不重新创建意图。
```

验收：并发同参、同键异参、执行后响应丢失、崩溃重启、记录过期后迟到重试；说明保护窗口。Redis/内存演示不能证明重启安全。

例外：无副作用查询不用幂等表；具体持久化方案随项目选型，但不能省略重复副作用保护。

## REMOTE-001：重试先有契约，再有预算

**适用**：HTTP/RPC、SDK 与消息重投。**要求**：连接/读取或总超时明确，重试层级和总预算有界；只对契约允许的瞬时故障退避并加抖动。写入沿原请求号，未知结果先查证。

```java
// 反例：catch (Exception e) { return callAgainWithNewId(); }
// 正例：参数/鉴权错误不重试；受控读操作按预算重试；
// 非幂等写入超时保存 UNKNOWN，交由原号查询或批准的恢复流程。
```

验收：连接失败、读取超时、限流、永久错误和下游已成功但响应丢失；统计实际总尝试次数，避免 SDK 与应用重试相乘。

例外：同步纯读可直接报可重试错误，不为每个读取建立状态机。

## OBS-001：日志够定位，敏感信息不出边界

**适用**：日志、异常和关键审计。**要求**：结构化记录操作号、主体引用、结果与耗时；不记录密码、Authorization、签名密钥、完整个人信息或任意完整请求体。关键事实审计按业务要求持久化。

```java
// 反例：log.info("request={}, headers={}", request, headers);
// 正例：log.info("operationId={} result={}", operationId, resultCode);
```

验收：用带敏感内容的失败输入检查响应与日志；一次系统异常只记录一次堆栈，能关联操作。日志参数化不自动防换行伪造，外部字符串须限制/清洗或结构化编码。

例外：示例只读工程没有关键写事实，不能声称已实现生产审计体系。

## CHECK-001：检查必须执行，报告必须分层

**适用**：所有交付。**要求**：使用实际构建配置的命令，选择与变更相关的验证；不机械运行无关测试或跳过失败后宣称通过。

- 反例：`mvn -DskipTests package` 后写“测试通过，生产可用”。
- 正例：报告“主代码编译通过；Checkstyle 通过；实际 HTTP 断言 N 项通过；无数据库，事务/幂等未验证”。
- 验收：命令、退出码、断言数量与结果可复核；静态门禁要以一个故意违规样例验证确实失败，随后恢复。临时测试是否入库遵循项目要求。
- 自动化范围：参考工程的 Checkstyle 只覆盖导入、花括号、空 catch、缩进、行宽及手写方法 Javadoc 存在性和参数/返回标签；注释是否准确表达业务仍需人工或智能体核对；本页业务规则依赖契约验证、实际测试及审查，不能宣称已全部被 CI 强制执行。
- 例外：文档变更验证引用和包一致性即可，不编造 Java 测试。没有真实环境时明确未验证项。
