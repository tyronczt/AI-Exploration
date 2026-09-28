package com.example.reference.web.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;

/** Web 组织详情请求，不接收企业归属作为授权依据。 */
@Getter
@Setter
public final class OrganizationDetailQuery implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 稳定组织标识，非空且最多 64 字符。 */
    @NotBlank
    @Size(max = 64)
    private String organizationId;
}
