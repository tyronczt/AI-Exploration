# Redis 开发、审查与运行规范

版本：2.6.0。外部资料核验日期：2026-09-30。适用于实际使用 Redis 的 Java/Spring 缓存、并发控制、计数、消息及运行配置；开发与审查共用本文，对应 **REDIS-001**，按行为追加 SERIAL-001、CONFIG-001、CON-001、TX-001、IDEM-001、REMOTE-001、AUTH-001、OBS-001。

项目已确认的版本、业务契约与设施优先。**必须/禁止**用于正确性、安全及数据保护；**默认/建议**为团队采用的实践，可记录替代方案。普通数据库查询不因此增加 Redis；已有设施能解决时，不新增 RedisUtils、统一缓存框架、Redisson 或其他依赖。读取本文不授权连接实例、清理数据或修改部署。

按任务读取：Key/缓存查第 1～3 节，计数/限流/一次性凭据查 3.1，客户端查第 4 节，扫描/脚本查第 5 节，锁查第 6 节，消息查第 7 节，部署/排查查第 8～9 节；验收和来源见第 10～11 节。

## 1. 先确认用途与实际版本

复用项目已有配置与决策文档，至少核对本次涉及的事项，不为小改动创建独立登记系统：

| 事项 | 必须明确的内容 |
| --- | --- |
| 用途与事实来源 | 可重建缓存、短期协调、计数还是可靠消息；权威数据在哪里，丢失/陈旧会造成什么结果 |
| 技术与拓扑 | Redis 服务端、Spring Boot/Data Redis、Lettuce/Jedis/Redisson 实际版本；Standalone、Sentinel、Cluster 或云代理；主从读策略 |
| Key 与协议 | 业务 owner、命名与隔离范围、数据类型、序列化、TTL/保留窗口、失效及清理责任 |
| 容量与时限 | 单值字节数、集合/Stream 增长、热点流量、内存预算、连接/命令/阻塞读取时限与重试总预算 |
| 故障与恢复 | 不可用、满内存、主从切换、超时结果未知时的行为；可恢复依据、告警及回滚路径 |

语法存在不表示当前服务端、客户端或代理支持。本文 Spring 示例依据 3.5 文档，不要求项目升级；如需 UNLINK（Redis 4.0+）、XAUTOCLAIM（6.2+）或其他能力，分别核验服务端和驱动。后续版本的命令、参数和响应格式不能直接套给旧项目。

## 2. Key、数据结构与容量

- 新 Key 默认用可读业务命名空间，以英文冒号分隔；缓存载荷发生不兼容变化时使用协议版本或明确迁移策略。共享实例的环境、已有企业/租户/权限范围必须纳入隔离设计；物理隔离且不共享 Key 时可省环境段，没有租户模型不增造租户字段。
- 例如 `mall:prod:organization:profile:v1:enterprise-a:org-a1` 表示组织资料缓存。`profile`、`lock`、`event` 分开，不能复用同一 Key 承担不同类型或含义；实际 ID、大小写和编码规则沿业务契约。构造规则集中在项目已有位置，生产者、消费者与清理逻辑一致。
- Key 不拼完整手机号、令牌、密码或任意请求体。来自请求的标识按既有格式校验或编码，避免分隔符、通配符和 `{}` 改变命名/扫描/slot 语义；缓存键的范围不替代服务端资源授权。
- 按实际访问选择 String、Hash、Set、ZSet、List 或 Stream；只需按 ID 取对象时沿已有表示，不为节省内存直接改类型或换协议。排序/排名说明分值精度与并列次序；金额不使用浮点分值作为权威账务。
- 为单值字节数、集合成员数和增长速度确定项目预算，检查访问复杂度、网络字节量、内存及尾延迟。10 KB、1,000/5,000 成员等上游阈值仅为参考，不能当 Redis 限制或所有业务的强制线；理论最大值也不是安全预算。
- BigKey 先限定业务范围，按需采样长度/成员数及 `MEMORY USAGE`，不下载完整值来判断大小。HotKey 先看已有客户端/代理采样和节点流量；拆分须保留聚合、顺序和更新语义。给 Cluster 加节点不自动分散一个 Key 的写入；本地缓存仅在允许陈旧且失效/恢复可验证时采用。

依据：[Redis Key 设计](https://redis.io/docs/latest/develop/using-commands/keyspace/)、[阿里云开发运维规范](https://help.aliyun.com/zh/redis/use-cases/development-and-o-and-m-standards-for-apsaradb-for-redis)；GitHub 容量与热点实践的固定来源及取舍见第 11 节。

## 3. TTL 与缓存一致性

- 可重建缓存默认有业务合理的 TTL；明确单位、正常/空值保留时间及可接受陈旧程度。确需长期保留的 Stream、索引或状态可不设 Key 过期，但须有容量、保留、清理和恢复依据，不机械给所有 Key 加 TTL 或定时“续命”。
- 对必须带 TTL 的 String 写入，使用现有客户端映射的一次 `SET ... EX/PX ...`；不能拆成写值成功后再 EXPIRE，留下崩溃造成的永久 Key。Hash/计数等按实际语义复用原子命令或有界脚本；覆盖写入时核验 TTL 是否保留/重设。普通 GET 不续 TTL，滑动过期须显式设计并核验所有读取路径。
- TTL 抖动必须仍落在允许的陈旧上限内。负缓存只表示“已授权查询确认不存在”，使用较短期限并处理新建失效；超时、反序列化失败和权限不足不写成“不存在”。合并回源、限流、预热和 Bloom Filter 按实际压力选择，不全部叠加。
- 已采用 Cache-Aside 时，数据库提交成功后再使相关缓存失效；覆盖写入、删除、恢复及所有会改变缓存结果的入口。失效失败须按陈旧容忍度记录并恢复，不能仅吞异常。提交后回调与 Redis 命令不构成跨资源原子提交；可靠恢复有实际需求时复用本地消息/已有补偿机制。
- 对照并发窗口：读者已读旧数据库值 → 写者提交新值并删除缓存 → 读者迟到填回旧值。先写库再删缓存、延迟双删或 transactionAware 都不能单独证明强一致。按业务选择有界陈旧、版本条件、权威重查或已有一致性机制；余额、批准、权限撤销与资金终态不由缓存作最终决定。
- keyspace 过期通知和 Pub/Sub 在断线时可能丢失，过期事件也不保证在 TTL 到点立刻送达；不把它们作为唯一关单、退款、权限撤销或可靠清理调度。需要执行事实时沿持久化状态与可恢复任务处理。

依据：[SET](https://redis.io/docs/latest/commands/set/)、[TTL](https://redis.io/docs/latest/commands/ttl/)、[Microsoft Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)、[Redis keyspace 通知](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/)。

### 3.1 计数、限流与一次性凭据

仅在实际采用时检查，不因场景清单新增设施。计数/限流先确认主体、窗口、并发上限、精度与故障策略；来自请求的用户/IP 标识不可直接作为可信身份，代理来源按已确认链路校验。

- 首次 INCR 与窗口 TTL 的建立在同一受支持的原子操作/有界脚本内完成，参数/类型先校验；不拆成 INCR 成功后再 EXPIRE。明确固定窗口还是从首次请求起算，是否允许边界突发；不每次重设 TTL 变成无限滑动窗口，也不把固定窗口宣称精确滑动限流。
- 明确计数整数范围、溢出/WRONGTYPE、淘汰、切换及超时结果未知时的返回政策；INCR 不是幂等命令，未知结果后重试可能再次增加。脚本原子执行不代表运行错误会撤回之前写入。限流故障放行/拒绝须有业务依据，Redis 临时计数不代替资金事实/可靠幂等记录。
- 验证码、一次性凭据明确签发范围、用途、TTL、尝试次数、重发与旧凭据撤销；不记录明文凭据。校验匹配、未过期、次数与消费在同一原子条件下完成；禁止 GET 后业务校验再 DEL，也不能 GETDEL 后才判断输入是否正确，导致错误输入消耗合法凭据。涉及多个 Key 的脚本按拓扑核验同 slot 等限制。
- 凭据消费成功后本地业务失败，两者不自动回滚；按既定操作标识、可重试结果或重新签发政策恢复，不能直接重新放回已消费凭据。实际采用会话滑动有效期时，另有绝对到期/撤销政策和权威认证依据，GET 不默认续命。

| 场景 | 条件 | 必须断言 |
| --- | --- | --- |
| 计数过期 | 首次计数、并发首次、过期窗口；客户端断线/超时 | 需 TTL 的 Key 不永久遗留；窗口/次数有界；未知结果按契约处理，不声称恰好一次 |
| 限流边界 | 窗口首尾突发、不同可信主体、超上限、Redis 不可用 | 主体隔离和既定限额/突发政策；故障结果明确，恢复不造成无界放行 |
| 凭据消费 | 错误输入、过期、尝试耗尽、两次并发正确输入、重发 | 正确凭据不被普通错误输入提前无条件消费；成功最多一次；重发/旧凭据政策与安全限次一致 |
| 后续失败/会话 | 已消费后业务失败；滑动续期至绝对期限；撤销 | 可定位并按既定政策恢复；不能靠续 TTL 越过绝对期限/撤销，不能误称跨资源原子 |

依据：[Redis INCR 与计数/限流模式](https://redis.io/docs/latest/commands/incr/)；脚本、锁和恢复分别沿第 5～7 节，不强制某个限流算法或客户端。

## 4. Java 客户端与序列化

- 复用受管的 RedisTemplate/StringRedisTemplate、连接工厂和已有客户端，不逐请求创建客户端，也不手动关闭共享 Bean。连接池、共享连接与阻塞连接按当前驱动配置；不因“Redis 必须用池”强制改变 Lettuce 的非阻塞共享方式。
- 已配置的 RedisTemplate 可复用；Spring Data 的 RedisConnection 包装器不跨线程共享，不能因底层 Lettuce 原生连接线程安全就把事务、Pipeline 或阻塞状态共用。阻塞消费确认线程、连接、取消与关闭责任，不能耗尽普通缓存请求使用的资源。
- 显式核验 connect、命令/读取、借连接等待及重试总预算，单位与部署覆盖按 CONFIG-001。BLOCK 等待与客户端命令超时协调，允许响应和调度余量；不能把小于阻塞等待的超时当作正常消费方式。同步、异步或 Reactive 的实际执行器、订阅和完成语义分别验证。
- 分清 key、value、hashKey、hashValue 和 Stream 载荷的序列化。新值沿已确认的 String/JSON/二进制契约；Java Serializable/UID 不等于 Redis wire 协议兼容。禁止对不可信输入使用 Java 原生反序列化；JSON 类型恢复也不能无界信任外部任意类型名。
- 改序列化、类名或载荷字段时验证旧值读取、新旧实例并存及回滚读取；区分缺失、损坏和协议不兼容，不把异常统一吞成 cache miss。可重建缓存可按版本隔离并受控淘汰；消息、锁和不可重建状态不能靠清空解决。
- Spring Data Redis 3.5 的 RedisCacheConfiguration 默认无 TTL、允许 null、值使用 JDK 序列化；CacheWriter 默认清理策略使用 KEYS/DEL。大 Keyspace 的 `@CacheEvict(allEntries = true)`/Cache.clear 须追踪到实际 writer，并选择兼容驱动/拓扑的有界策略；不仅搜索手写 KEYS。3.5 文档中 SCAN 策略支持 Lettuce，而 Jedis 仅支持非 Cluster 模式，其他版本再核验。
- 核验 @Cacheable/@CacheEvict 的真实代理入口、键构造、命中和失效，参见 [完整规范 8.1](standards.md#81-注解要经过实际代理入口)。locking CacheWriter 是缓存级锁，不等同每条业务数据的分布式互斥；transactionAware 不让数据库和 Redis 成为同一个事务。

依据：[Spring Data Redis 3.5 驱动](https://docs.spring.io/spring-data/redis/reference/3.5/redis/drivers.html)、[Template 与序列化](https://docs.spring.io/spring-data/redis/reference/3.5/redis/template.html)、[Redis Cache](https://docs.spring.io/spring-data/redis/reference/3.5/redis/redis-cache.html)。

## 5. 命令、批处理与脚本

- 生产业务请求不执行全库 KEYS 或无界 HGETALL、SMEMBERS、LRANGE 0 -1、大范围 ZSet 查询。命令是否适用取决于实际集合上限和调用频率，受控的小集合全量读取不自动构成缺陷。
- 大范围维护使用 SCAN/HSCAN/SSCAN/ZSCAN，限定命名空间、批次、速率和任务总时限；保存并继续服务器返回的游标，**以游标回到 0 结束，不能因本批为空结束**。COUNT 是工作量提示，不保证每批条数；结果可能重复，统计唯一对象或产生副作用时按实际需求去重/幂等。它不是一致快照或业务分页接口，MATCH 也不保证只扫描匹配 Key。
- 通过驱动的 Cluster 能力覆盖本次相关主节点，逐节点游标/拓扑变化另查；单节点 SCAN 不等于全 Cluster 扫描。迁移中“没扫到”不能作为唯一的不存在证明。
- Pipeline 只减少往返，限定命令数、总请求/回复字节与内存，读取并核验每个结果。它不是事务，也不能将一批非幂等写在超时后盲目整批重放；MGET、Pipeline 或多节点分发按实际 slot 和客户端语义选择，不宣称某一种永远更快。
- Lua/Functions 只用于确需原子性的短操作；参数校验在写入前完成，Key 通过 KEYS、普通参数通过 ARGV，禁止拼用户输入生成脚本、无界循环或脚本内扫描大集合。运行错误不应被假定能撤销此前写入；原子执行不等于数据库回滚。缓存脚本丢失/NOSCRIPT 时复用客户端加载机制，不改成无保护的多命令降级。
- MULTI/EXEC 的执行错误不回滚其他已执行命令；WATCH 冲突须识别返回并有界重试。Redis 的事务/脚本不能回滚数据库、HTTP 或机构副作用。
- Cluster 的多 Key 原子操作、事务及脚本核验同 slot。需要同业务对象共槽时才用 hash tag，如 `mall:reservation:{order-42}:state` 与 `mall:reservation:{order-42}:token`；不把所有订单写成同一个 `{order}`，也不自动用企业标识把大量热点集中到一槽。
- 大 Key 删除先核对对象和回源影响；已支持时评估 UNLINK 的异步释放，并监控后台释放与内存峰值。不把 UNLINK 当成容量无限或删除无需授权，也不为可直接使用的能力复制大型分批删除框架。

依据：[SCAN](https://redis.io/docs/latest/commands/scan/)、[Pipeline](https://redis.io/docs/latest/develop/using-commands/pipelining/)、[Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/)、[Redis 事务](https://redis.io/docs/latest/develop/using-commands/transactions/)、[Cluster 规范](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)、[UNLINK](https://redis.io/docs/latest/commands/unlink/)。

## 6. 分布式锁与业务幂等

- 先复用唯一约束、条件更新、短事务和已有并发设施。确需 Redis 锁时写明保护资源、竞争范围、等待预算、租约/续租、释放、失效后的业务保护；缩小临界区，但不能提前释放尚未提交的本地业务事务所需的锁。
- 手工单实例租约使用一次 `SET key ownerToken NX PX leaseMillis`，ownerToken 对每次获取唯一，TTL 为正。不能 SETNX 后另设 TTL；只在确认取得锁时进入临界区，超时结果未知不能按“没有加锁”直接执行业务或无限换号重试。
- 释放和续租必须在同一个原子操作中校验 ownerToken；不能先 GET 校验再 DEL/PEXPIRE，也不能无条件删锁。已有锁组件按其 owner/thread 语义释放，只由成功获取者负责；不得吞掉失去所有权的异常后继续报告业务保护有效。
- **错误交错**：A 的 GET 读到自身令牌 → A 暂停且租约到期 → B 获取同 Key → A 恢复执行 DEL，删除了 B 的锁。原子比较删除防止误解锁，但不能阻止 A 此后继续写业务数据。
- 对状态、金额、库存等正确性要求，实际写入边界仍以持久化条件/唯一性或经验证的 fencing 拒绝迟到操作。随机 ownerToken 不是单调 fencing token；前置 GET、自旋续租和 watchdog 不能单独消除 GC 暂停、网络分区和故障切换窗口。CON-001、IDEM-001 继续适用。
- 已用 Redisson 时核验项目版本与实际重载：本次固定源码中，显式正 leaseTime 路径不会启动 watchdog 续租，省略租约的路径才调度续租。不能对 `tryLock(wait, lease, unit)` 宣称任务会无限自动续租；异步/Reactive 还核验 owner/thread 传递、取消及 finally 的实际完成。
- Redis 主从异步复制的故障切换可能丢失已确认的锁记录；Sentinel、Cluster、WAIT 或 Redlock 名称不单独证明业务互斥/零丢失。不为普通任务自动引入多主 Redlock，按实际故障模型和写入方保护验证。
- 幂等记录的 TTL/淘汰不能让迟到请求再次付款、扣库存或执行其他不可恢复副作用；重复结果、异参冲突、崩溃恢复仍按 [IDEM-001](practical-rules.md#idem-001同号同意图异参必须拒绝)。缓存锁只减少竞争，不替代权威事实。

依据：[Redis 分布式锁](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)、[复制边界](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)、[Martin Kleppmann 的 fencing 分析](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)；Redisson 固定实现见第 11 节。

## 7. 消息与 Redis Stream

只有项目实际采用或本次明确选型时读取本节；不将 Redis 普遍禁止用作消息，也不自动替换现有 MQ。

- Pub/Sub 适合允许丢失的瞬时通知，不能作为可靠业务事件的唯一通道。Stream 的保留、消费组和 PEL 提供恢复基础，但不自动形成端到端 exactly-once 或无限保留。
- 生产事件有稳定 eventId、载荷版本及必要业务关联。数据库提交与 XADD 不原子；需要可靠交付时复用本地消息/Outbox 或等效可恢复设施。XADD 超时可能已经成功，再次发送可产生不同 Stream ID；消费者按业务 eventId/作用域防重，不能只按 Stream ID 判断同一业务意图。
- 消费组初始化明确从历史起点还是 `$` 开始，不能遇 NOGROUP 就默认从 `$` 重建而跳过历史。并行实例有可区分的 consumer 身份和关闭责任；按实际版本选择 XREADGROUP 的新消息和 pending 读取，不误把 `>` 的新消息循环当作旧 PEL 恢复。
- 可靠业务处理在本地事实及幂等记录提交成功后 XACK；不能使用 NOACK、receiveAutoAck 或“收到就 ACK”后再写业务。处理失败留可恢复记录；提交成功而 ACK 失败允许重投，复用已完成的幂等结果后再确认。XACK 移除该组 PEL 记录，不等于删除 Stream 消息，也不保证其他组已处理。
- 有界扫描 XPENDING，按处理时限和故障模型使用 XCLAIM 或支持时的 XAUTOCLAIM 接管；接管不自动停止旧消费者执行，仍须业务幂等和状态条件。选择合理 idle 阈值、退避、重试次数与人工/隔离流程，不反复抢占仍正常处理的消息。
- 对无法反序列化、永久失败或重试耗尽的消息，先按已确认流程持久化原因和可回放材料，再确认/隔离；记录 eventId、失败类型及载荷引用，不能直接 ACK 丢弃，也不把含敏感信息的完整正文写日志。外部副作用仍按原操作号查证/恢复。
- 用 MAXLEN/MINID 等控制容量时，保留窗口覆盖所有相关组的延迟、故障恢复和已确认审计要求。裁剪可能删除未处理正文并留下 PEL 引用，不能从“PEL 还在”推定可重放；较新版本的裁剪选项与响应变化分别核验。Stream Key 的整体过期/淘汰也可能丢失消费状态，不能套普通缓存 TTL。
- 有序入流不等于多消费者完成顺序；需要对象内顺序时结合业务版本/前置状态、分区或既有调度保证。验收积压、消费者崩溃、重复、乱序、裁剪及重启后的实际结果，不仅验证 XADD 成功或收到回调。

依据：[XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/)、[XAUTOCLAIM](https://redis.io/docs/latest/commands/xautoclaim/)、[XTRIM](https://redis.io/docs/latest/commands/xtrim/)、[Spring Data Redis 3.5 Stream](https://docs.spring.io/spring-data/redis/reference/3.5/redis/redis-streams.html)、[Pub/Sub 与 keyspace 通知](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/)。

## 8. 集群、持久化与淘汰

- 确认主从读延迟、拓扑发现/刷新及 MOVED/ASK 处理由当前驱动负责；不靠固定主节点地址绕过 Sentinel/Cluster。需要新鲜的状态/授权/锁检查不默认从副本读取；恢复和发布期间验证实际路由。
- 核验真实 maxmemory 与 maxmemory-policy，包括云产品默认值。缓存可按访问特点选择 LRU/LFU 等；不可重建的 Stream、幂等或协调数据须避免被普通缓存淘汰，并有容量、写失败及恢复政策。需要隔离时先评估现有实例/配额，不一律给每个模块开新实例。
- noeviction 会使部分需要新增内存的写入报错，不等于资源无限；volatile-* 只以带过期时间的 Key 为候选，不能保证任意业务 Key 永远存在。TTL、淘汰、持久化、复制是不同机制，分别验收。
- RDB 是时间点快照，AOF everysec 在故障时仍存在丢失窗口；主从复制默认异步，WAIT 不能让 Redis 成为强一致存储。按实际持久化、备份及故障模型记录可接受丢失窗口与恢复时间，涉及不可恢复副作用时保留权威持久化事实。
- maxmemory 预算留出进程、复制/AOF 缓冲、后台处理与故障恢复所需空间；观察 RSS、碎片、evicted/expired、拒绝写、复制延迟、磁盘和客户端缓冲，而非只看 used_memory。备份存在不等于能恢复，恢复演练在隔离环境进行。

依据：[淘汰](https://redis.io/docs/latest/develop/reference/eviction/)、[持久化](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)、[复制](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)、[Cluster 规范](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)。

## 9. 安全、排查与运维

- 按 AUTH-001 使用网络访问控制、所需 TLS 和最小 ACL；应用身份限制所需命令及 Key 范围，运维身份分开，凭据由现有秘密配置提供。命名空间、DB 编号和日志脱敏不替代访问控制；ACL/服务端版本与脚本所需权限实际核验。
- 不可用时，可重建查询缓存按已确认政策受控回源/降级，并限制并发和恢复洪峰；锁、幂等、授权、预算及可靠消息失败不能降级成“默认批准”或“已执行成功”。区分 cache miss、超时、协议损坏、OOM、READONLY、CROSSSLOT 和连接错误，避免逐层重试相乘。
- 排查先确认实例、环境、拓扑、业务前缀及实际只读权限。先用已有监控和限定的 INFO、SLOWLOG GET、TYPE、PTTL、长度/成员数、采样 MEMORY USAGE；必要时再有界扫描。不返回完整敏感值；慢日志/命令统计中的 Key、参数、端点同样脱敏。
- --bigkeys/--hotkeys 等扫描工具先核验版本、LFU 等前提、节点范围和负载，再按批准范围限速；不把“只读”当作零成本。MONITOR、全库抓包或 DEBUG 不作为默认排查手段，避免负载及敏感参数扩散。
- FLUSHALL/FLUSHDB、CONFIG SET、消费组销毁/重置、批量 DEL/UNLINK 和数据迁移属于显式维护操作。执行前提供同范围只读预检、候选数量或有边界的估计、最多 20 个脱敏关键样例，以及竞争/回源、恢复和回滚方案；扫描不是一致快照，预检不等于写入授权。
- 清理必须保留前缀边界，重核实际候选及协议，避开新写入或同名复用；不能把预检后的通配匹配当成可靠对象身份。发布改 Key/序列化/配置时写明新旧实例共存、撤回及旧数据清理时点，不将清空缓存当成通用升级步骤。

依据：[Redis ACL](https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/)、[CLI 的采样/扫描工具](https://redis.io/docs/latest/develop/tools/cli/)、阿里云与 CacheCloud 实践；采纳边界见第 11 节。

## 10. 验收与反例

按本次变更选择必要场景，复用现有验证设施；记录服务端/客户端版本、拓扑、输入、实际断言和失败日志。普通文档更新只检查文档与分发；不得把以下验收方案报告成已执行。

| 变更 | 关键验收 |
| --- | --- |
| Key/缓存/TTL | 不同实际作用域隔离、首次 miss/后续 hit、到期/更新/删除/恢复失效、负缓存新建、TTL 写入崩溃窗口、数据库提交后失效失败及旧值迟到回填 |
| 客户端/协议 | 实际部署覆盖与正值超时、阻塞读取超时配合、资源关闭、旧值/新旧实例/回滚读取、损坏值与正常 miss 分开 |
| 扫描/批处理 | 中间空批而游标非 0、重复元素、最后批游标 0、COUNT 非硬上限、总预算、Cluster 节点范围与单条失败/超时未知 |
| 锁/幂等 | 竞争失败、业务异常、租约到期与迟到写入、他人接管后旧释放、固定租约/续租路径、切换丢记录、重复/异参/重启及实际持久化保护 |
| Stream | 新消息与 PEL 恢复、提交前崩溃、提交后 ACK 失败、相同 eventId 不同 Stream ID、旧消费者迟到、毒消息/隔离、乱序、积压、裁剪与重启 |
| 容量/部署 | 大/热点访问的字节与尾延迟、集中到期/恢复峰值、满内存拒绝写/淘汰、主从延迟/切换、恢复演练与 ACL 拒绝越界 |

源码/配置推导只能证明相应条件；mock 不证明 Redis 的原子性、故障切换或真实数据库幂等。支付、退款和权限的真实环境验证另按其契约与授权进行，不能借规范评测调用真实副作用。

## 11. 外部资料与采纳边界

本次以 `Redis 开发规范`、`BigKey/HotKey`、`distributed lock`、`consumer group`、`Spring Data Redis Cache` 等关键词检索 GitHub、X/Twitter 及官方资料，回溯以下原始内容。搜索未穷尽全网；转载和平台摘要不算独立技术依据，检索/阅读也不表示运行或集成上游工程。

| 原始来源与核验 | 采纳与不采纳 |
| --- | --- |
| [Redis 官方文档](https://redis.io/docs/latest/)，本次涉及的具体页面已在各节链接；滚动版本按核验日期追踪 | 采用命令、扫描、锁、消息、复制与持久化语义；每次实现再核验项目版本，不推广较新命令/参数为旧版本默认能力 |
| [Spring Data Redis 3.5](https://docs.spring.io/spring-data/redis/reference/3.5/)，实际读取驱动、Template、Cache 和 Stream 页面 | 采用连接线程边界、默认清理/TTL/序列化与 ACK 行为；不为项目升级框架或强制改客户端 |
| [ITcathyh/redis-best-practice](https://github.com/ITcathyh/redis-best-practice/blob/3dbf962ee2c98cd61f6d33010c238cc6b0e8c9c5/README.md)，固定源码已读取 | 借鉴业务命名、容量和有界命令检查；不采纳所有 Key 必须过期、永久数据异步续命、普遍禁用消息用途、某 Pipeline 永远更快及跨产品统一默认淘汰策略；脚本普通参数名为 ARGV |
| CacheCloud [BigKey](https://github.com/sohutv/cachecloud/blob/e984733b8d2cdedf51e4f84e8394b785c6df2c2f/cachecloud-web/src/main/resources/static/wiki/troubleshooting/bigkey.md)、[HotKey](https://github.com/sohutv/cachecloud/blob/e984733b8d2cdedf51e4f84e8394b785c6df2c2f/cachecloud-web/src/main/resources/static/wiki/troubleshooting/hotkey.md)，固定源码已读取 | 借鉴字节/成员/延迟、节点倾斜与限速采样；不机械采用 100 KB 阈值、DEBUG/MONITOR/抓包或旧分批删除代码。样例空批先 continue、后判游标可错过终止，按官方 SCAN 语义另验 |
| Redisson [RedissonLock.java](https://github.com/redisson/redisson/blob/65517022236c6721eaf480d71bcdb9dd02b8132f/redisson/src/main/java/org/redisson/RedissonLock.java)，固定源码的获取及续租分支已核验；[官方锁说明](https://redisson.pro/docs/data-and-services/locks-and-synchronizers/) | 采用正 leaseTime 与 watchdog 分支的区分；不因采用 Redisson 声称业务一致性、自动无限续租或故障切换零丢失；当前项目版本仍需单独核验 |
| [X/Twitter 工程：Improving key expiration in Redis](https://blog.x.com/engineering/en_us/topics/infrastructure/2019/improving-key-expiration-in-redis)，2019-04-12 原文已读取 | 借鉴升级后对过期回收、内存、淘汰及尾延迟做实测；案例涉及 Redis 2.4/3.2，不复制其内核采样常数或周期全库扫描方案，不宣称所有版本存在同一缺陷 |
| [阿里云 Tair 开发运维规范](https://help.aliyun.com/zh/redis/use-cases/development-and-o-and-m-standards-for-apsaradb-for-redis)，原文已读取 | 借鉴用途区分、命名、资源预算、热点与命令边界；不把产品默认淘汰策略、数值阈值、Jedis 推荐或云部署方案变成全部 Redis 项目的要求 |
| [Microsoft Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)、[Martin Kleppmann 分布式锁分析](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)，原始文章已读取 | 采用一致性窗口与写入方 fencing 的判断依据；不复制云部署/.NET 样例，不将锁算法争论直接等同当前业务的已证实缺陷 |

X 状态帖检索中的产品发布/示例线索未作为通用 Java/Redis 规范；实际采纳的是上述可读取的工程原文，缺失的嵌入帖不作证据。微信搜一搜仍未取得可核验文章，不计为本次来源。固定评审材料 E16/E17 只供后续验证，模型、Redis 与故障演练均不能由资料阅读宣称通过。
