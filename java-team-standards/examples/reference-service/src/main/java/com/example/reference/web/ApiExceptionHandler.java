package com.example.reference.web;

import com.example.reference.web.vo.ApiResponseVO;
import java.util.NoSuchElementException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** 对外输出固定安全消息，不将异常详情、输入值或内部路径返回调用方。 */
@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /**
     * 将绑定、JSON 解析及类型校验失败转换为 400，不把原始输入或框架异常详情返回客户端。
     *
     * @param exception 框架捕获的参数异常，仅用于异常路由，不向外输出其消息
     * @return INVALID_ARGUMENT 错误响应
     */
    @ExceptionHandler({BindException.class, MethodArgumentTypeMismatchException.class,
        HttpMessageNotReadableException.class})
    public ResponseEntity<ApiResponseVO<Void>> invalidArgument(Exception exception) {
        return error(HttpStatus.BAD_REQUEST, "INVALID_ARGUMENT", "请求参数不合法");
    }

    /**
     * 将业务动作权限拒绝映射为 403。
     *
     * @return FORBIDDEN 错误响应
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponseVO<Void>> forbidden() {
        return error(HttpStatus.FORBIDDEN, "FORBIDDEN", "无操作权限");
    }

    /**
     * 将不存在及不可见的资源统一映射为 404，避免通过错误差异枚举其他企业资源。
     *
     * @return NOT_FOUND 错误响应
     */
    @ExceptionHandler({NoSuchElementException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponseVO<Void>> notFound() {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND", "资源不存在或不可见");
    }

    /**
     * 将路由不支持的 HTTP 方法映射为 405；安全过滤链提前拒绝的请求由过滤链处理。
     *
     * @return METHOD_NOT_ALLOWED 错误响应
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponseVO<Void>> methodNotAllowed() {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "请求方法不支持");
    }

    /**
     * 将不支持的请求媒体类型转换为 415，避免将错误的 Content-Type 当成系统故障。
     *
     * @return UNSUPPORTED_MEDIA_TYPE 错误响应
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponseVO<Void>> unsupportedMediaType() {
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "请求媒体类型不支持");
    }

    /**
     * 兜底处理未预期故障：在统一边界记录一次堆栈，对外只返回固定安全提示。
     *
     * @param exception 用于内部定位的原始异常
     * @return HTTP 500 和 INTERNAL_ERROR 错误体
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseVO<Void>> unexpected(Exception exception) {
        LOG.error("Unexpected organization request failure", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "服务暂不可用");
    }

    /**
     * 同时构造 HTTP 状态和统一错误体，错误时业务 data 为 null。
     *
     * @param status 与错误分类一致的 HTTP 状态
     * @param code 稳定错误码
     * @param message 可安全展示的提示
     * @return 完整错误响应
     */
    private ResponseEntity<ApiResponseVO<Void>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(ApiResponseVO.error(code, message));
    }
}
