package com.example.reference.web;

import com.example.reference.web.vo.ApiResponseVO;
import com.example.reference.web.vo.CsrfTokenVO;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 为已认证的演示客户端提供 CSRF 令牌，保留 POST 查询的安全保护。 */
@RestController
@RequestMapping("/api/reference")
public class SecurityController {
    /**
     * 获取 POST 请求所需的令牌；客户端保留响应 Cookie，后续仍须发送 HTTP Basic 凭证。
     * 此接口只提供安全元数据，不授予组织读取权限，也不向客户端暴露完整框架对象。
     *
     * @param token Spring Security 为当前请求提供的 CSRF 令牌
     * @return 令牌请求头名称及令牌值；框架默认安全响应头禁止缓存
     */
    @GetMapping("/csrf")
    public ApiResponseVO<CsrfTokenVO> csrf(CsrfToken token) {
        return ApiResponseVO.ok(new CsrfTokenVO(token.getHeaderName(), token.getToken()));
    }
}
