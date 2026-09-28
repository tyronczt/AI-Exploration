package com.example.reference.application.dto;

import java.io.Serial;
import java.io.Serializable;
import lombok.Getter;

/** 内部组织详情条件，保留 Web 与应用层契约边界。 */
@Getter
public final class OrganizationDetailQueryDTO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 非空的稳定组织标识，最多 64 字符。 */
    private final String organizationId;

    /**
     * 建立内部详情条件；内部调用同样校验 ID，不能只依赖 Web 校验。
     *
     * @param organizationId 非空且最长 64 字符的组织标识
     * @throws IllegalArgumentException ID 缺失、空白或超过长度限制
     */
    public OrganizationDetailQueryDTO(String organizationId) {
        if (organizationId == null || organizationId.isBlank() || organizationId.length() > 64) {
            throw new IllegalArgumentException("Invalid organization identifier");
        }
        this.organizationId = organizationId;
    }
}
