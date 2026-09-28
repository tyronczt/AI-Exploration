# 最小 Java 参考工程

Java 21、Spring Boot 3.5.16、Maven 单模块，只读组织查询。目的是让团队看到规范如何对应实际代码和验收；不预设支付、账户等真实职责，不是生产脚手架。

## 运行

需要 JDK 21 和 Maven 3.6.3+。让智能体在本目录执行：

```bash
mvn -q -DskipTests clean verify
```

这条命令执行 Checkstyle、主代码编译和打包，跳过测试执行；本包不提交测试文件，不能称为“单元测试通过”。Checkstyle 在 validate 阶段执行，检查星号导入、花括号、空 catch、4 空格缩进、120 字符行宽及手写方法/构造方法的 Javadoc 与参数/返回标签；包声明和 import 不受行宽限制。

运行前设置至少 12 字符的临时 `DEMO_PASSWORD` 环境变量，再执行：

```bash
java -jar target/reference-service-0.1.0.jar
```

不在仓库、命令示例或日志中保存真实密码。未设置密码时启动失败；`SERVER_PORT` 可覆盖默认 8080。服务仅绑定 127.0.0.1。使用完停止本次启动进程并清理会话环境变量。

HTTP Basic 教学账号：alice 属 enterprise-a，有组织读取权限；bob 属 enterprise-b，有组织读取权限；blocked 属 enterprise-a，无组织读取权限。三个账号使用同一个临时演示密码，内存 BCrypt 存储，认证逐请求校验；默认 CSRF 令牌使用 HttpSession 保存，客户端必须保留对应 Cookie，该会话不保存登录身份。此方案仅用于本机演示；正式系统须替换为已确认身份和凭证管理方案。

## 对象写法

Query、DTO、VO 统一普通 class + Lombok，使用 getXxx/setXxx。Query 使用 @Getter/@Setter；分页 Query 字段初始化为 1/20，显式 setter 对 null 恢复默认值，以保留空参数绑定行为。非法数字仍由 @Valid 拒绝。

只读 DTO/VO 保持 final 字段和 @Getter；普通构造由 @AllArgsConstructor 生成，涉及校验或集合防御性复制的构造方法显式保留，不给身份和共享只读数据增加 setter。没有值比较需求，不额外生成 equals/hashCode/toString。

Lombok 版本沿用 Spring Boot 的依赖管理，POM 显式配置注解处理器，仅用于编译并从可运行 JAR 排除。IDE 若提示 getter 不存在，检查项目 JDK、Maven 导入和 Lombok/注解处理支持，以 Maven 构建结果为准。依据见 [Lombok Maven 配置](https://projectlombok.org/setup/maven) 和 [getter/setter 规则](https://projectlombok.org/features/GetterSetter)。

## 方法注释

Service、Controller、Repository 及其他手写方法均给出 Javadoc，按签名说明参数、返回与主要异常；权限、资源范围、分页空结果、构造校验和默认值处理写明业务含义。Lombok 生成的访问器不另写样板注释。

Checkstyle 的 MissingJavadocMethod/JavadocMethod 覆盖手写方法和构造方法（含 private），覆盖方法可继承已有契约。工具检查注释及参数/返回标签是否缺失，不判断业务描述是否正确；后者仍须结合代码审查。删除 Service.page 的 Javadoc 后，mvn validate 必须失败，恢复后通过。

## 序列化边界

11 个 Query/DTO/VO 均直接实现 Serializable，显式声明 @Serial 和 serialVersionUID=1L；无公共数据时不引入空 BaseRequest。已有项目基类可复用，但子类仍维护自己的 UID。

Web 实际采用 Jackson JSON：Query 用无参构造/setter 绑定，VO 用 getter 输出，不包含 serialVersionUID。只读 DTO/VO 当前没有 JSON 输入用途，未为其添加可变 setter 或强制无参构造；以后用于 RPC/消息 JSON 输入时，按实际序列化器增加 creator/property 映射或符合协议的 JavaBean，并做往返验证。

ApiResponseVO<T> 的 Java 序列化还取决于实际 T 及其整个对象图；包装类的标记不保证任意 payload 可序列化。原生对象流仅用本地产生的可信数据进行验证，工程不提供 Java 反序列化入口，不信任外部传来的 CallerDTO。Java 对象流恢复不依赖普通构造校验，不能由本例推定该入口安全。

本版本已通过 64 项序列化断言，覆盖同版本原生对象流往返、嵌套集合、非 Serializable payload 拒绝，以及应用实际 ObjectMapper 的 Query JSON 绑定/校验和 VO 字段输出；40 个 POST/GET HTTP 场景通过，验证范围见下表。未验证新旧类版本交叉读取、RPC、Redis 或 MQ 序列化配置。

## 看哪条调用链

```text
OrganizationController
  Query 校验 → 内部 QueryDTO → OrganizationService
  → 检查动作权限 → Repository 限定可信企业 → 排序和分页
  → 内部结果 DTO → Web VO
```

`web/query`、`application/dto`、`web/vo` 分别维护对象边界。Controller 显式转换；Service 校验动作权限并按服务端认证关系限定资源。Repository 固定返回不可变 DTO 投影，未接 ORM，暂不创建 Entity/Mapper 空层。

示例只读数据不可变，可被并发请求安全读取；没有写入竞争、锁、事务或持久化保证。数据库接入后，过滤、排序、分页和计数应下推查询。

## 接口契约

团队按业务请求参数数量选择方法：超过 3 个用 POST，3 个及以内的简单只读查询可用 GET。本示例只有 pageNo、pageSize 两个参数，保留已确认的 `POST /api/reference/organizations/page` 契约，用于演示 JSON 绑定与 CSRF；不表示分页必须 POST，也不以未来筛选字段作为强制理由。应用服务仍只读，原根路径不提供列表；详情 GET 保持不变。

调用顺序：

1. 带 HTTP Basic 凭证访问 `GET /api/reference/csrf`，保存 Cookie 和响应 data 中的 headerName、token。
2. 带同一 Cookie、Basic 凭证和返回的令牌请求头访问分页接口；不能只带 Cookie 代替身份凭证。

```http
POST /api/reference/organizations/page
Content-Type: application/json

{"pageNo":1,"pageSize":20}
```

上例只展示业务请求；实际调用另按步骤添加认证与 CSRF 信息，不将令牌写入日志。保留 Spring Security 默认保护，未通过 CSRF 的 POST 会先返回 403。令牌接口不授予 organization:read 权限。

示例使用 NullSecurityContextRepository 不保存登录身份，避免将逐请求 Basic 认证当作反复登录而重置令牌；CSRF 仓储仍使用默认 HttpSession。已验证同一令牌可连续请求、缺失/错误令牌被拒绝，以及只带 Cookie 和令牌、未带身份凭证时仍返回 401。正式项目改用其他登录机制时重新核验登录、登出和令牌刷新流程。依据见 [Spring Security CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html)。

- `POST /api/reference/organizations/page`：`@Valid @RequestBody` 接收 JSON；`{}` 或分页字段 null 使用 1/20 默认值，pageSize 范围 1～100。缺失请求体、JSON 解析或约束错误为 400；错误 Content-Type 为 415。超过末页返回空 items，保留可见 total。
- `GET /api/reference/organizations/detail?organizationId=org-a1`：ID 必填且不超过 64 字符；跨企业与不存在均返回相同 404，减少资源枚举信息。
- 响应统一为 `code/message/data`，成功 `code=OK`；分页数据为 `items/total/pageNo/pageSize`。组织 VO 只包含 `id/displayName/createdAt`，不暴露内部企业字段。
- 排序：`createdAt DESC, id DESC`；这里只保证固定数据顺序，不承诺 offset 分页在并发写入下有快照一致性。
- 错误：参数 400/INVALID_ARGUMENT，认证 401/UNAUTHENTICATED，动作权限 403/FORBIDDEN，资源 404/NOT_FOUND，方法 405/METHOD_NOT_ALLOWED，媒体类型 415/UNSUPPORTED_MEDIA_TYPE，未预期故障 500/INTERNAL_ERROR。CSRF 保持默认开启，POST 须提供有效令牌及对应 Cookie。

## 可重放的验收清单

让智能体启动应用后，通过本机 HTTP 请求逐项断言；密码只从当前环境读取。验收脚本按目标项目政策保留在本地，不需要同事安装 Python 或运行安装脚本。

| 输入/场景 | 应断言的结果 |
| --- | --- |
| 匿名、错误密码访问令牌/详情 | 401 + UNAUTHENTICATED |
| blocked 查列表或详情 | 403 + FORBIDDEN |
| alice 默认列表 | total=2，pageNo=1，pageSize=20，顺序 org-a2、org-a1 |
| pageSize=1 的第 1、2、3 页 | org-a2、org-a1、空列表；total 始终为 2 |
| pageNo=2147483647，pageSize=100 | 空列表，不因 offset 溢出返回其他数据 |
| pageSize=100 | 正常返回两条 |
| pageNo 为 0、-1、abc、2147483648 | 400 + INVALID_ARGUMENT |
| pageSize 为 0、-1、101、abc | 400 + INVALID_ARGUMENT |
| bob 列表 | total=1，仅 org-b1 |
| alice 附加 enterpriseId=enterprise-b | 仍只返回企业 A 的两条；客户端字段不能扩权 |
| alice 查 org-a1 | 200；VO 只有约定字段 |
| alice 查 org-b1、查不存在 ID | 两者响应一致，404 + NOT_FOUND |
| 详情缺 ID、空白 ID、65 字符 ID | 400 + INVALID_ARGUMENT |
| 无 CSRF 或错误 CSRF 的 POST | 403 + FORBIDDEN |
| 缺失请求体、非法 JSON、非法字段类型 | 合法 CSRF 下返回 400 + INVALID_ARGUMENT |
| 非 JSON Content-Type | 合法 CSRF 下返回 415 + UNSUPPORTED_MEDIA_TYPE |
| GET /organizations/page | 405 + METHOD_NOT_ALLOWED |
| Cookie 和令牌有效但没有身份凭证 | 401；CSRF 会话不授予登录身份 |

每次检查 HTTP 状态、code、data 和敏感字段泄漏。还可在临时副本加入 `import java.util.*;`，执行 `mvn -q validate` 必须失败；恢复后通过，避免配置了插件但未运行。

2026-09-28 本版本已完成：构建和静态检查通过，40 个 HTTP 场景覆盖 POST 分页、GET 详情和认证/CSRF，星号导入负例被门禁拦截后恢复通过。临时验证脚本和日志不随包发布。没有验证真实数据库、事务、重启幂等、生产身份服务、500 故障注入或模型对照收益；新增写入时按 [可执行规则](../../multi-center-code-review/references/practical-rules.md) 补充实际验证。

规则依据：WEB-001、WEB-002、ERR-001、AUTH-001、SERIAL-001、CHECK-001。技术要求以 [Spring Boot 3.5 官方要求](https://docs.spring.io/spring-boot/3.5/system-requirements.html) 为准；参考工程锁定版本不自动决定后续业务项目版本。
