package com.example.reference.security;

import com.example.reference.application.dto.CallerDTO;
import com.example.reference.web.vo.ApiResponseVO;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.NullSecurityContextRepository;

/** 仅用于本机演示；账号与企业关系由服务端固定，正式项目替换为已确认身份服务。 */
@Configuration
public class DemoSecurityConfiguration {
    /** 可信的账号归属和动作权限映射，业务请求不能覆盖。 */
    private static final Map<String, CallerDTO> CALLERS = Map.of(
        "alice", new CallerDTO("enterprise-a", Set.of("organization:read")),
        "bob", new CallerDTO("enterprise-b", Set.of("organization:read")),
        "blocked", new CallerDTO("enterprise-a", Set.of())
    );

    /**
     * 创建仅用于本机演示的内存账号，临时密码以 BCrypt 哈希存储；业务动作权限另由 CALLERS 维护。
     *
     * @param password 由 DEMO_PASSWORD 注入的临时密码，至少 12 字符，不得写入日志
     * @return 三个固定演示账号的身份数据源
     * @throws IllegalArgumentException 临时密码不足 12 字符
     */
    @Bean
    UserDetailsService users(@Value("${DEMO_PASSWORD}") String password) {
        if (password.length() < 12) {
            throw new IllegalArgumentException("DEMO_PASSWORD must have at least 12 characters");
        }
        String encoded = new BCryptPasswordEncoder().encode(password);
        return new InMemoryUserDetailsManager(CALLERS.entrySet().stream()
            .map(entry -> User.withUsername(entry.getKey()).password("{bcrypt}" + encoded)
                .authorities("DEMO_AUTHENTICATED").build()).toList());
    }

    /**
     * 构建不持久化登录态的 HTTP Basic 认证链，保留 CSRF 保护，认证或过滤链拒绝返回统一 JSON。
     * 此配置只验证演示身份；业务权限和企业资源范围仍由应用服务处理。
     *
     * @param http Spring Security 提供的过滤链构建器
     * @param mapper 应用统一配置的 JSON 序列化器
     * @return 供本机只读接口使用的安全过滤链
     * @throws Exception 过滤链构建失败，阻止应用带缺失安全配置启动
     */
    @Bean
    SecurityFilterChain security(HttpSecurity http, ObjectMapper mapper) throws Exception {
        // POST 查询也保留 CSRF；认证逐请求校验，HttpSession 仅用于默认 CSRF 令牌存储。
        // 不保存登录上下文；避免会话登录检测将每次 Basic 认证视为新登录并清除 CSRF 令牌。
        return http.securityContext(context -> context.securityContextRepository(new NullSecurityContextRepository()))
            .requestCache(cache -> cache.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .httpBasic(basic -> basic.authenticationEntryPoint((request, response, failure) -> {
                response.setHeader("WWW-Authenticate", "Basic realm=\"reference\"");
                writeError(response, mapper, 401, "UNAUTHENTICATED", "请先认证");
            }))
            .exceptionHandling(errors -> errors.accessDeniedHandler((request, response, failure) ->
                writeError(response, mapper, 403, "FORBIDDEN", "无操作权限")))
            .csrf(Customizer.withDefaults())
            .build();
    }

    /**
     * 按已认证账号读取服务端固定授权关系，不接受客户端传入的企业和权限作为依据。
     *
     * @param authentication 非空且已由安全过滤链认证的身份
     * @return 服务端维护的不可变调用范围
     * @throws org.springframework.security.access.AccessDeniedException 认证账号不在演示身份映射中
     */
    public CallerDTO caller(Authentication authentication) {
        CallerDTO caller = CALLERS.get(authentication.getName());
        if (caller == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unknown demo identity");
        }
        return caller;
    }

    /**
     * 向安全过滤链的失败响应写入 UTF-8 JSON，避免绕过 Controller 的错误返回另一套格式。
     *
     * @param response 待写入的 HTTP 响应
     * @param mapper 应用统一 JSON 序列化器
     * @param status 对应失败的 HTTP 状态码
     * @param code 稳定错误码
     * @param message 不含凭据和内部异常细节的安全消息
     * @throws IOException 响应流写入失败
     */
    private static void writeError(HttpServletResponse response, ObjectMapper mapper,
            int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), ApiResponseVO.error(code, message));
    }
}
