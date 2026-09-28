package com.example.reference.application.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.Getter;

/** 内部分页结果，不直接序列化为 Web 响应。 */
@Getter
public final class OrganizationPageDTO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 本页可见组织，按创建时刻和标识降序。 */
    private final List<OrganizationDTO> items;

    /** 当前调用主体可见组织总数。 */
    private final long total;

    /** 从 1 开始的当前页码。 */
    private final int pageNo;

    /** 当前请求的每页条数。 */
    private final int pageSize;

    /**
     * 保存已完成权限筛选的分页结果，并复制列表以隔离后续修改；总数和分页口径由调用方保证。
     *
     * @param items 本页不可含 null 的组织列表
     * @param total 相同授权与筛选条件下的组织总数
     * @param pageNo 从 1 开始的页码
     * @param pageSize 本次请求的每页条数
     * @throws NullPointerException 列表或其中元素为 null
     */
    public OrganizationPageDTO(List<OrganizationDTO> items, long total, int pageNo, int pageSize) {
        this.items = List.copyOf(items);
        this.total = total;
        this.pageNo = pageNo;
        this.pageSize = pageSize;
    }
}
