# Java 项目实践与采纳边界

版本：2.3.0。源码核验日期：2026-09-29。适用于模块边界、复杂用例、策略扩展、状态流转、事件协作及验证方案；对应 ARCH-001、EXT-001，并补充 CON-001、TX-001、ERR-001、CHECK-001。普通 CRUD 不要求先读完本文。

本次研究 COLA、Spring Modulith 和 Spring Petclinic 的官方源码/文档。选择依据是它们分别提供分层与扩展实现、模块边界验证、可运行的 Spring 示例及测试；不是按 Star 排名认定全部代码都是团队标准。下文区分源码事实与团队采纳决策，不把样例的缺省配置当成生产方案。

导航：[模块边界](#1-模块边界要能验证) · [用例与模型](#2-用例编排与业务规则分开) · [扩展点](#3-扩展点先有变化再选机制) · [状态与事件](#4-状态机与事件不替代持久化保护) · [验证](#5-测试证明什么就报告什么) · [来源与取舍](#6-源码依据与不采纳的做法)。

## 1. 模块边界要能验证

**团队规则 ARCH-001**：先给出本次涉及模块的公开入口、内部实现、允许依赖与事实写入方，再决定包或 Maven 模块。应用服务可调用本模块能力及其他模块的公开契约，不直接使用对方 Mapper、DO、内部 Service 或内部 Spring Bean；同进程不为隔离目录额外增加 RPC。

| 决策 | 默认处理 | 何时升级 |
| --- | --- | --- |
| 包还是 Maven 模块 | 单部署单元内按业务包划分；现有工程结构优先 | 编译隔离、独立发布或实际复用需求明确时再拆模块 |
| Service 是否需要接口 | 单实现的内部编排可直接用类 | 确有跨模块公开契约或外部能力隔离时定义最小接口，即使暂时只有一个实现 |
| 外部能力端口 | 接口由使用方业务语义定义，适配器实现技术调用 | 需要隔离 SDK、远端系统或复杂领域存储时采用；简单 CRUD 不强加 Gateway/Repository 双层 |
| 架构门禁 | 复用已有 ArchUnit、Modulith 或项目检查；无工具时限定范围检查 import、依赖及调用 | 边界反复被破坏、有可维护的规则后，经选型再增加依赖；不能把 rg 检索报告成完整架构证明 |

端口的方法应表达业务需求，例如“查原操作结果”，而不是暴露 SDK Request、ORM Wrapper 或无边界的通用 execute。已采用领域模型时，纯业务规则不直接依赖 Controller、持久化实现、HTTP 客户端或静态 ApplicationContext 查找；依赖从已有构造/装配边界显式提供。不要因此给普通 CRUD 造一层空领域模型。

不能为了消除循环依赖把双方全部业务搬进 common；先判断事实归属、调用方向和公开契约。公共模块只容纳语义相同且稳定的能力。反射、字符串 Bean 查找和任意 ApplicationContext.getBean 不作为绕过依赖规则的出口。

**验收**：采用自动门禁时，在临时副本加入一次“模块 A 调用 B 内部 Mapper”或循环依赖，证明检查失败，再恢复并通过；记录实际扫描的包、排除范围与例外。只有目录名称、注释、空测试方法或被注释的断言，不能报告“架构约束已生效”。存量例外限定到实际依赖边，不为通过检查把整个业务包排除。

## 2. 用例编排与业务规则分开

COLA 的 application/domain/gateway 提供了职责切分线索；本团队仍采用既有 Controller、Service、Mapper/Repository 命名和 Query → DTO → VO 边界，不强制每个用例配一个 CmdExe/QryExe 类，也不替换为 COLA 响应对象。

- **Controller/消息入口**处理协议、可信上下文和边界转换；同一业务用例从 HTTP、消息、任务进入时复用同一规则，不复制三个状态判断分支。
- **应用服务**协调授权、加载/保存、事务及副作用。方法按业务动作命名；当一个 Service 包含多项独立用例时按职责拆分，不按代码行数或一条 SQL 一个类拆分。
- **领域行为（按需）**集中维护复杂不变量；批准、预占、关闭通过带前置条件的业务方法表达，避免外部随意 setStatus/setBalance 绕过规则。数据库条件更新仍负责多请求竞争，内存对象校验不替代 CAS。
- **值对象（按需）**在金额与币种、区间等反复出现且有联合不变量时才创建；保持不可变或受控修改，明确 equals/hashCode、精度、单位和空值。不为每个 String/Long 包一层类；也不从别的项目复制名为 Money 的类型就宣称金额安全。
- **查询**可按只读 DTO/投影获取需要的字段，不必加载完整聚合；读写方法职责分开不等于必须建设 CQRS、双库或事件溯源。任何投影仍保留主体范围及分页 total 口径。

以“退款申请”为职责示意：入口转换 Query → 用例核验授权与原操作 → 在同一预算记录上原子预占并落退款意图 → 提交后调用外部能力或按既有任务派发 → 返回 DTO 再转 VO。费率/额度规则可以抽成纯计算；不能把跨网络调用和 UNKNOWN 恢复藏进一个声称“无副作用”的领域方法。此处是责任分配示意，不是可直接运行的支付实现。

异常保持现有 ERR-001/REMOTE-001 分类：业务拒绝、依赖失败、结果未知不能合成一个“失败”码。适配器保留 cause 并转换外部协议，统一出口返回安全错误；禁止通用 AOP catch-all 吞异常后返回成功或绕过事务回滚。采用 BizException/SysException 名称本身不证明分类、HTTP 状态和重试行为正确。

## 3. 扩展点先有变化，再选机制

**团队规则 EXT-001**：只有同一用例已有多个真实策略且变化边界明确时才抽扩展点。简单稳定分支用现有 if/switch；已有多个策略时优先项目当前策略接口或 Spring 注入列表/Map，不因参考 COLA 就引入新的扩展框架。扩展点封装“变化的业务计算/适配”，共同授权、幂等、审计和事务留在统一用例边界。

扩展契约写清：选择键来源、各策略适用范围、无匹配、多匹配、允许的默认行为、输入/返回/错误语义、是否有副作用。租户、渠道或产品键从可信配置及授权关系确定，不能让请求自由指定任意实现类或 Bean。

| 情况 | 团队要求 | 验收样例 |
| --- | --- | --- |
| 精确匹配 | 同一有效选择键得到确定策略，公共校验仍执行 | 两个合法产品各命中预期策略，越权主体被拒绝 |
| 无匹配 | 按业务契约报不支持；只有明确等价且获准的默认策略才回退 | 未配置产品不能默默走另一个支付渠道/费率 |
| 重复注册/多匹配 | 固定注册表启动时失败；动态配置发布前验证并原子切换 | 两个实现声明相同键，不能后注册覆盖前者 |
| 策略执行失败 | 分类报告；不把执行异常当成“查找不到策略”再回退 | 远程结果未知沿原操作查询，不改路由重做副作用 |
| 配置变更 | 进行中的有副作用操作保存决定所需策略版本/关键快照 | 重试复用原决定，配置更新不改写历史意图 |

Spring 单例策略不在成员字段保存当前请求、租户或可变金额；共享缓存/注册表说明并发与更新方式，单次上下文沿参数传递。扩展实现必须遵守同一超时、幂等和异常契约，不允许某个实现跳过公共安全检查。

COLA 的扩展查找具有默认场景回退，注册实现检查坐标重复。这说明“采用扩展框架”之前仍须确定路由政策；**本团队不默认采纳业务回退**。规则依据与代码入口见第 6 节，不复制整套扩展框架。

## 4. 状态机与事件不替代持久化保护

采用状态机前先列出当前状态、事件、条件、目标状态、同号重复和副作用。少量稳定状态可用枚举与显式分支；引入库时仍须明确拒绝、无转换和异常结果，不能把“返回原状态”当成成功。

COLA 本次核验的 `StateMachineImpl` 接收源状态并返回目标状态；其 `verify(state,event)` 检查是否存在事件转换，不接收业务上下文，也不完成条件、持久化或幂等校验。团队因此要求：

1. 从权威存储读取状态及版本；内存路由只产生候选决定。
2. 以旧状态/版本、主体与必要预算条件完成原子写入，检查影响行数；失败后重新核验，不盲目覆盖。
3. 条件判断保持无副作用。Action 若执行写入或远程调用，必须说明与状态保存的顺序、崩溃窗口和恢复；不能“先付款后 CAS 失败”再重试付款。优先复用现有持久化意图与派发机制。
4. 测试合法/非法转换、条件不满足、重复事件、并发竞争和执行后响应丢失。规则图或可视化只描述允许关系，不证明实际业务已受保护。

模块事件先说明采用哪种交付语义：同步处理的失败与事务关系、提交后处理的失败责任，或已接入的可靠发布/消费机制。异步注解和提交后监听本身不证明崩溃后可恢复。需要可靠交付时核验实际持久化配置、原事务写入、重试入口、消费幂等及积压告警；已有可靠机制满足需求就复用，不重复建设。

Spring Modulith 的事件发布登记是可选能力，是否持久化、如何重投由实际依赖/配置决定。引入它不等于业务副作用恰好执行一次，也不自动替代跨服务 MQ、幂等和失败补偿。验收至少包含原事务回滚、监听失败、进程重启、重复投递和消费者升级后的事件兼容。

## 5. 测试证明什么就报告什么

沿用 CHECK-001：测试层次由本次风险决定，不要求每个方法都写三套测试；框架注解、包名和版本以目标项目实际依赖为准。

| 待证明行为 | 最小合适验证 | 不能据此宣称 |
| --- | --- | --- |
| 纯规则/策略 | 普通单测覆盖边界、非法输入和策略选择，不启动完整 Spring | 已验证数据库事务、权限过滤链 |
| Web 契约 | 现有 MVC 切片或实际 HTTP；验证绑定、错误、JSON 与适用安全链 | Mock Service 已证明真实 SQL/资源权限；关闭过滤器后的测试已证明授权 |
| 存储与并发 | 目标数据库版本的隔离实例验证唯一性、条件更新、提交/回滚及映射 | H2/mock 证明 MySQL collation、锁与约束完全一致 |
| 模块接口 | 已有模块测试或最小集成；模拟明确外部边界，核验输入/输出契约 | mock 掉全部内部逻辑后证明了模块实际业务 |
| 第三方适配 | 受控协议服务模拟超时、错误、响应丢失等；必要时授权沙箱联调 | 模拟服务器证明真实机构已经支持或接通 |
| 架构/构建门禁 | 实际绑定的命令、故意违规失败样例、恢复后成功与执行报告 | 插件出现在 pom/pluginManagement 中就已执行，零测试等于测试通过 |

使用事务回滚型测试时，另选最小提交场景检查 after-commit 监听、真实提交时约束及跨线程行为；不能让测试事务掩盖生产提交边界。时间/随机性导致用例不稳定时，复用已有 Clock、固定输入和有界等待，避免依赖当前系统时间与长 sleep。

保持现有“测试文件仅本地验证、不提交 Git”的项目要求；仍报告验证命令、环境、断言/失败与可复查结果，不能因此伪称已有 CI 回归。文档更新只做链接、安装映射及包一致性校验；本轮没有运行这三个上游项目，也没有为参考工程新增运行时依赖或架构门禁。

## 6. 源码依据与不采纳的做法

固定读取版本：COLA `352e1a867538d9cd40e1b11e4028fa652fc97557`（master）、Spring Modulith `ce7cd2500b503a56486af4d547aad515d80d31d1`（main）、Spring Petclinic `818c4136ea971c21674525f9053de0d9c7ad8cfe`（main）。这是研究快照，不是推荐升级版本；不把主分支等同于稳定发行版。下列是已读取的源码事实，采纳规则由本团队另行确定。

| 已核验来源 | 源码事实 | 本团队采纳与边界 |
| --- | --- | --- |
| [COLA ChargeServiceImpl](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/main/java/application/ChargeServiceImpl.java) | 应用服务组织 session/account/charge 调用 | 学习职责拆分，不把示例当成已具备并发、事务、审计的计费系统 |
| [COLA ChargeController](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/main/java/adapter/ChargeController.java) | 直接使用示例 Request/Response 与内部 DTO | 保留本团队 Query/VO、鉴权和错误契约，不照搬接口对象 |
| [COLA ChargeGateway](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/main/java/domain/gateway/ChargeGateway.java)、[ChargeRecord](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/main/java/domain/charge/ChargeRecord.java) | 领域包存在 JpaRepository、JPA 映射和 IDENTITY 主键 | 不将此轻量模板描述为严格不依赖 ORM；不替换团队 MyBatis、雪花 ID、时间列和金额单位 |
| [COLA DomainFactory](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/main/java/domain/DomainFactory.java)、[CleanArchTest](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-archetypes/cola-archetype-light/src/main/resources/archetype-resources/src/test/java/CleanArchTest.java) | 工厂通过上下文取 Bean；架构测试的核心断言被注释 | 不复制静态服务定位器；门禁必须以故意违规样例验证，不能以测试类存在作证 |
| [COLA ExtensionExecutor](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-components/cola-component-extension-starter/src/main/java/com/alibaba/cola/extension/ExtensionExecutor.java)、[ExtensionRegister](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-components/cola-component-extension-starter/src/main/java/com/alibaba/cola/extension/register/ExtensionRegister.java) | 查找按场景逐级回退，注册检测重复坐标 | 采纳显式匹配及冲突检查；回退需业务契约，不默认引入组件或 ExtPt 命名 |
| [COLA StateMachineImpl](https://github.com/alibaba/COLA/blob/352e1a867538d9cd40e1b11e4028fa652fc97557/cola-components/cola-component-statemachine/src/main/java/com/alibaba/cola/statemachine/impl/StateMachineImpl.java) | 转换选择与执行、无转换回调、候选状态返回 | 区分路由与条件校验、持久化、幂等及恢复，不默认引入状态机库 |
| [Modulith 模块验证](https://github.com/spring-projects/spring-modulith/blob/ce7cd2500b503a56486af4d547aad515d80d31d1/src/docs/antora/modules/ROOT/pages/verification.adoc) | 检查模块循环、内部包访问和可选依赖声明；开放模块有例外 | 采纳可执行边界约束；仅在已引入兼容组件时调用其验证，不为普通 CRUD 强制安装 |
| [Modulith 模块测试](https://github.com/spring-projects/spring-modulith/blob/ce7cd2500b503a56486af4d547aad515d80d31d1/src/docs/antora/modules/ROOT/pages/testing.adoc)、[事件机制](https://github.com/spring-projects/spring-modulith/blob/ce7cd2500b503a56486af4d547aad515d80d31d1/src/docs/antora/modules/ROOT/pages/events.adoc) | 模块范围测试；同步/异步监听及可选发布登记 | 采纳测试范围与事件交付责任的区分，不把监听注解当作可靠交付或跨服务事务 |
| [Petclinic OwnerControllerTests](https://github.com/spring-projects/spring-petclinic/blob/818c4136ea971c21674525f9053de0d9c7ad8cfe/src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTests.java)、[pom.xml](https://github.com/spring-projects/spring-petclinic/blob/818c4136ea971c21674525f9053de0d9c7ad8cfe/pom.xml) | MVC 切片验证表单/错误/视图；构建绑定格式与 Checkstyle 检查；该快照使用 Boot 4.1.0 | 学习真实行为断言和生命周期绑定；不复制服务端页面/JPA 模型、认证假设或版本组合，不升级当前 Boot 3 参考工程 |

引用用于解释设计来源，本文未复制上游实现。要实际引入依赖或复制代码，另外核验目标发行版、许可证、维护状态和与现有 JDK/Spring 的兼容性；源码目录名称、README 宣传和流行程度都不能代替验证。
