package com.example.reference.application.dto;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** 应用层组织数据；所属企业仅用于内部授权，不暴露到示例 Web 响应。 */
@Getter
@AllArgsConstructor
public final class OrganizationDTO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 稳定组织标识。 */
    private final String id;

    /** 组织主档展示名称。 */
    private final String displayName;

    /** 权威组织主档记录的归属企业标识。 */
    private final String enterpriseId;

    /** 组织创建时刻，UTC。 */
    private final Instant createdAt;
}
