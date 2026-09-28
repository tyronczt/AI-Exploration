package com.example.reference.web.vo;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Web 组织展示对象，仅包含约定公开字段。 */
@Getter
@AllArgsConstructor
public final class OrganizationVO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 来源于组织主档的稳定标识。 */
    private final String id;

    /** 来源于组织主档的展示名称，不拼接企业内部字段。 */
    private final String displayName;

    /** 来源于主档的创建时刻，ISO-8601 UTC。 */
    private final Instant createdAt;
}
