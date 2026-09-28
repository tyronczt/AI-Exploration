package com.example.reference.web.vo;

import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** POST 调用所需的 CSRF 展示数据，令牌不得写入日志或共享缓存。 */
@Getter
@AllArgsConstructor
public final class CsrfTokenVO implements Serializable {
    /** Java 对象序列化版本号，不代表安全协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** Spring Security 指定的令牌请求头名称。 */
    private final String headerName;

    /** 当前 CSRF 会话对应的令牌值，来源于 Spring Security。 */
    private final String token;
}
