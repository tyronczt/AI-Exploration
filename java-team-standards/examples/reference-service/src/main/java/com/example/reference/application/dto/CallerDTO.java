package com.example.reference.application.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.Set;
import lombok.Getter;

/** 由服务端认证关系解析的调用范围，不接受客户端自行声明。 */
@Getter
public final class CallerDTO implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 认证账号所属企业标识。 */
    private final String enterpriseId;

    /** 已验证的动作权限，如 organization:read。 */
    private final Set<String> permissions;

    /**
     * 保存服务端解析的企业与权限，复制权限集合以隔离调用方后续修改。
     *
     * @param enterpriseId 可信认证关系中的企业标识
     * @param permissions 已授予的非空动作权限集合，不得含 null
     * @throws NullPointerException 权限集合或其中元素为 null
     */
    public CallerDTO(String enterpriseId, Set<String> permissions) {
        this.enterpriseId = enterpriseId;
        this.permissions = Set.copyOf(permissions);
    }
}
