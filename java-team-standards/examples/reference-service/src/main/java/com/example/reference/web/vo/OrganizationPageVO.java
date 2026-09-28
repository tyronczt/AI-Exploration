package com.example.reference.web.vo;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** Web 分页结果，不返回 Spring Page 或 ORM 分页对象。 */
@Getter
@AllArgsConstructor
public final class OrganizationPageVO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 已通过动作与资源权限筛选的本页组织。 */
    private final List<OrganizationVO> items;

    /** 当前主体可见组织的总数，与 items 使用相同筛选口径。 */
    private final long total;

    /** 从 1 开始的当前页码。 */
    private final int pageNo;

    /** 当前请求的每页条数。 */
    private final int pageSize;
}
