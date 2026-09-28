package com.example.reference.web.query;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.io.Serial;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

/** Web 分页请求，缺省值在绑定时统一补齐，非法值拒绝。 */
@Getter
@Setter
public final class OrganizationPageQuery implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 从 1 开始的页码，缺省为 1。 */
    @Min(1)
    private Integer pageNo = 1;

    /** 每页条数，缺省为 20，允许 1～100。 */
    @Min(1)
    @Max(100)
    private Integer pageSize = 20;

    /**
     * 绑定页码时将 null 归一为默认值 1；非法数字保留给后续 @Valid 校验，不静默改正。
     *
     * @param pageNo 客户端页码，缺失或空参数绑定得到的 null 使用默认值
     */
    public void setPageNo(Integer pageNo) {
        this.pageNo = pageNo == null ? 1 : pageNo;
    }

    /**
     * 绑定页大小时将 null 归一为默认值 20；上下限交由后续 @Valid 校验。
     *
     * @param pageSize 客户端每页条数，null 使用默认值
     */
    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize == null ? 20 : pageSize;
    }
}
