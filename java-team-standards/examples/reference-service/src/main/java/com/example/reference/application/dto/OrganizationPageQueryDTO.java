package com.example.reference.application.dto;

import java.io.Serial;
import java.io.Serializable;
import lombok.Getter;

/** 应用层分页条件，防止绕过 Web 的内部调用传入无界查询。 */
@Getter
public final class OrganizationPageQueryDTO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 从 1 开始的页码。 */
    private final int pageNo;

    /** 每页条数，范围 1～100。 */
    private final int pageSize;

    /**
     * 建立内部有界分页条件，防止非 Web 调用传入非法页码或无界页大小。
     *
     * @param pageNo 从 1 开始的页码
     * @param pageSize 每页条数，范围 1～100
     * @throws IllegalArgumentException 页码小于 1，或每页条数超出允许范围
     */
    public OrganizationPageQueryDTO(int pageNo, int pageSize) {
        if (pageNo < 1 || pageSize < 1 || pageSize > 100) {
            throw new IllegalArgumentException("Invalid paging range");
        }
        this.pageNo = pageNo;
        this.pageSize = pageSize;
    }
}
