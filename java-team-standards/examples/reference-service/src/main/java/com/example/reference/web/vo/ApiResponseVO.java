package com.example.reference.web.vo;

import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;

/** 示例统一响应；HTTP 状态仍表达成功或对应错误。 */
@Getter
@AllArgsConstructor
public final class ApiResponseVO<T> implements Serializable {
    /** Java 对象序列化版本号；兼容演进时保持稳定，不表示 JSON/RPC 协议版本。 */
    @Serial
    private static final long serialVersionUID = 1L;

    /** 稳定业务码：OK、INVALID_ARGUMENT、UNAUTHENTICATED、FORBIDDEN、NOT_FOUND、INTERNAL_ERROR 等。 */
    private final String code;

    /** 安全展示消息，不包含内部异常细节。 */
    private final String message;

    /** 成功时为业务 VO，错误时为 null。 */
    private final T data;

    /**
     * 构造成功响应，调用方仅传入已经完成权限筛选的 Web 展示对象。
     *
     * @param <T> Web 业务数据类型
     * @param data 成功结果；是否允许 null 由具体接口契约决定
     * @return code 为 OK 的统一响应
     */
    public static <T> ApiResponseVO<T> ok(T data) {
        return new ApiResponseVO<>("OK", "成功", data);
    }

    /**
     * 构造无业务数据的错误体；HTTP 状态由 Controller 异常处理或安全过滤链同时设置。
     *
     * @param code 稳定错误码
     * @param message 不含内部异常详情的安全提示
     * @return data 为 null 的统一错误体
     */
    public static ApiResponseVO<Void> error(String code, String message) {
        return new ApiResponseVO<>(code, message, null);
    }
}
